import { Request } from "express";
import { loginData } from "./src/types/user";

declare global {
  namespace Express {
    interface Request {
      user?: loginData;
    }
  }
}