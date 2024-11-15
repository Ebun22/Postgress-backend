import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";

export const adminMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (user.role == "ADMIN") {
        next()
    } else {
        next(new UnauthorizedException("Unauthorized: You don't have access"))
    }
}