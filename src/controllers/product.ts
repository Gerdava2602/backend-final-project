import { NextFunction, Request, Response } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";
import User from "../models/User";
import { createError } from "../utils/errors";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, price, description, image, category } = req.body;

  console.log(req.user);

  const user = await User.findOne(
    { email: req.user?.email, active: true },
    { password: 0 }
  );

  if (!user) return next(createError("User not found", 404));

  try {
    const product = await Product.create({
      name,
      price,
      description,
      image,
      category,
      user: new mongoose.Types.ObjectId(user._id),
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(id),
      active: true,
    });
    if (!product) return next(createError("Product not found", 404));
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    category,
    name,
    userId,
  }: {
    category?: string;
    name?: string;
    userId?: string;
  } = req.query;

  if (userId) {
    const user = await User.findOne(
      { _id: userId, active: true },
      { password: 0 }
    );

    if (!user) return next(createError("User not found", 404));
  }

  try {
    const products = await Product.aggregate([
      {
        $match: {
          ...(category && { category }),
          ...(name && { name: { $regex: name, $options: "i" } }),
          ...(userId && { user: new mongoose.Types.ObjectId(userId) }),
          active: true,
        },
      },
    ]);
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const userCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const { id } = req.params;

  const user = await User.findOne(
    { _id: new mongoose.Types.ObjectId(id), active: true },
    { password: 0 }
  );

  if (!user) return next(createError("User not found", 404));

  try {
    const categories = await Product.distinct("category", {
      user: new mongoose.Types.ObjectId(user?._id),
      active: true,
    });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { name, price, description, image, category } = req.body;
  try {
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(id),
      active: true,
    });

    if (!product) return next(createError("Product not found", 404));

    const user = await User.findOne(
      { email: req.user?.email, active: true },
      { password: 0 }
    );

    if (!user) return next(createError("User not found", 404));

    if (product.user.toString() !== user._id.toString())
      return next(createError("Unauthorized", 401));

    const updateProduct = await Product.updateOne(
      {
        _id: new mongoose.Types.ObjectId(id),
        active: true,
      },
      {
        name,
        price,
        description,
        image,
        category,
      },
      { new: true }
    );
    if (!updateProduct) return next(createError("Product not found", 404));
    res.status(200).json('Updated succesfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(id),
      active: true,
    });

    if (!product) return next(createError("Product not found", 404));

    const user = await User.findOne(
      { email: req.user?.email, active: true },
      { password: 0 }
    );

    if (!user) return next(createError("User not found", 404));
    
    if (product.user.toString() !== user._id.toString())
      return next(createError("Unauthorized", 401));

    const deleteProduct = await Product.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        active: true,
      },
      {
        active: false,
      },
      { new: true }
    );
    if (!deleteProduct) return next(createError("Product not found", 404));
    res.status(200).json('Deleted succesfully');
  } catch (error) {
    next(error);
  }
};
