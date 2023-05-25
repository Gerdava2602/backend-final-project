import { NextFunction, Request, Response } from "express";
import { comparePassword, generateToken, hashPassword } from "../utils/jwt";
import { createError } from "../utils/errors";
import User from "../models/User";
import { loginData, updateUserType, user } from "../types/user";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, name, lastname, phone, address }: user =
      req.body;
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email: email,
      username: username,
      password: hashedPassword,
      name: name,
      lastname: lastname,
      phone: phone,
      address: address,
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: loginData = req.body;

    const user = await User.findOne({ email: email, active: true });

    if (!user) {
      return next(createError("Usuario not found", 404));
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(createError("Invalid Credentials", 401));
    }

    const token = generateToken({
      email: user.email,
      password: user.password,
    });
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json({ message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id, active: true }, { password: 0 });
    if (!user) {
      return next(createError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const {
    username,
    email,
    password,
    name,
    lastname,
    phone,
    address,
  }: updateUserType = req.body;
  try {
    const user = await User.findOne({ _id: id, active: true });

    if (!user) {
      return next(createError("User not found", 404));
    }

    if (req.user?.email !== user.email) {
      return next(createError("Unauthorized", 401));
    }

    await User.updateOne(
      { _id: id, active: true },
      {
        username: username,
        email: email,
        password: password,
        name: name,
        lastname: lastname,
        phone: phone,
        address: address,
      },
      { new: true }
    );

    res.status(200).json("User updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id, active: true });

    if (!user) {
      return next(createError("User not found", 404));
    }

    if (req.user?.email !== user.email) {
      return next(createError("Unauthorized", 401));
    }

    await User.updateOne(
      { _id: id, active: true },
      {
        active: false,
      }
    );

    res.status(200).json("User deleted successfully");
  } catch (error) {
    next(error);
  }
};
