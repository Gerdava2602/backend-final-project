import { compare, genSaltSync, hash } from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { loginData } from '../types/user'

export const hashPassword = async (password: string) => {
    const salt = genSaltSync(10)
    return await hash(password, salt)
}

export const comparePassword = async (password: string, hash: string):Promise<boolean> => {
    return await compare(password, hash)
}

export const generateToken = (payload: loginData) => {
    return jwt.sign(payload, process.env.JWT_SECRET ?? '', { expiresIn: '1h' })
}

export const verifyToken = (req: Request & {user: loginData}, res: Response, next: NextFunction) => {
    try {
        jwt.verify(req.cookies.token, process.env.JWT_SECRET ?? '', (err: unknown, decoded: unknown) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            req.user = decoded as loginData;
        });
        next();
    } catch (error) {
        next(error);
    }
}