import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user";
import productRouter from "./routes/product";
import deliveryRouter from "./routes/delivery";
import { handleError } from "./utils/errors";
import { verifyToken } from "./utils/jwt";


dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use("/user", userRouter);
app.use("/product", productRouter);

app.use(verifyToken);
app.use("/delivery", deliveryRouter);

app.use(handleError);

export default app;