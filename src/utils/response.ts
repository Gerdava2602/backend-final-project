import {Request, Response} from 'express';

export const successResponse = (req: Request, res: Response, data:unknown, message='success',status = 200) => {
    return res.status(status).json({
        message,
        error: null,
        data,
    });
}

export const errorResponse = (req: Request, res: Response, error: Error, status = 500) => {
    return res.status(status).json({
        message: "error",
        error: {
            message: error,
        },
        data: null,
    });
}