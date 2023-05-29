import {Request, Response, NextFunction} from 'express';

type error = {
    status: number;
    message: string;
}

export const handleError = (err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    const handled_error: error = {
        status: status,
        message: message
    }
    res.status(status).json(handled_error);
}

export const createError = (message: string, status: number) => {
    const err: error = {
        status: status,
        message: message
    }
    return err;
};