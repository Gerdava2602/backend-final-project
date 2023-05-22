import { NextFunction, Request, Response } from "express";
import { comparePassword, generateToken, hashPassword } from "../utils/jwt";
import { createError } from "../utils/errors";
import User from "../models/user";
import { loginData, user } from "../types/user";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password }: user = req.body;
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email: email,
      username: username,
      password: hashedPassword,
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

    const user = await User.findOne({ email: email });

    if (!user) {
      return next(createError("Usuario not found", 404));
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(createError("Invalid password", 401));
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
