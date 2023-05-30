import { NextFunction, Request, Response } from "express";
import Delivery from "../models/Delivery";
import User from "../models/User";
import { createError } from "../utils/errors";
import mongoose from "mongoose";

export const createDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { product, quantity, date, status, comments, score } = req.body;
  try {
    const user = await User.findOne(
      { email: req.user.email, active: true },
      { password: 0 }
    );
    if (!user) return next(createError("User not found", 404));

    const delivery = await Delivery.create({
      user: new mongoose.Types.ObjectId(user._id),
      product: new mongoose.Types.ObjectId(product),
      quantity,
      date: date && new Date(date),
      status,
      comments,
      score,
    });
    res.status(201).json(delivery);
  } catch (error) {
    next(error);
  }
};

export const getDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const user = await User.findOne(
      { email: req.user.email, active: true },
      { password: 0 }
    );
    if (!user) return next(createError("User account not found", 404));

    const delivery = await Delivery.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!delivery) return next(createError("Delivery not found", 404));

    if (delivery.user.toString() !== user._id.toString())
      return next(createError("You are not allowed to see this delivery", 401));

    res.status(200).json(delivery);
  } catch (error) {
    next(error);
  }
};

export const getDeliveries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = req.query?.start;
  const end = req.query?.end;

  try {
    const user = await User.findOne(
      { email: req.user.email, active: true },
      { password: 0 }
    );
    if (!user) return next(createError("User account not found", 404));

    const deliveries = await Delivery.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(user._id),
          ...(start && { date: { $gte: new Date(start as string) } }),
          ...(end && { date: { $lte: new Date(end as string) } }),
        },
      },
    ]);
    res.status(200).json(deliveries);
  } catch (error) {
    next(error);
  }
};

export const updateDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { comments, score } = req.body;
  try {
    const user = await User.findOne(
      { email: req.user.email, active: true },
      { password: 0 }
    );
    if (!user) return next(createError("User account not found", 404));

    const delivery = await Delivery.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!delivery) return next(createError("Delivery not found", 404));

    if (delivery.user.toString() !== user._id.toString())
      return next(createError("You are not allowed to see this delivery", 401));

    await delivery.updateOne({ comments, score });
    res.status(200).json("Delivery updated successfully");
  } catch (error) {
    next(error);
  }
};
