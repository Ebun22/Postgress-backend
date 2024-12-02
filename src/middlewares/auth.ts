import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { JWT_SECRET } from "../secrets";
import jwt from "jsonwebtoken";
import { prisma } from "..";

export const authMiddleWare = async (req: Request, res: Response, next: NextFunction) => {
    // 1, get the token from Headers
    const token = req.headers.authorization?.split(" ")[1]
    //2, handle if token deosn't exist
    if (!token) {
        next(new UnauthorizedException("Unauthenticated: No validation token found"))
    }
    try {
        //3, if it deos, verify token and get payload
        const payload = jwt.verify(token!, JWT_SECRET) as any
        //4, use payload to find user in db
        const user = await prisma.user.findFirst({ 
            where: { id: payload.userId }
         });
        //5, if no user then throw unauthorized
        if (!user) {
            next(new UnauthorizedException("Unauthenticated: User doesn't exist"))
        }

        if (user) {
            //6, if user then add user to request 
            const { password, ...userWithoutPassword } = user
            req.user = userWithoutPassword;
            next()
        }

    } catch (err) {
        next(new UnauthorizedException("Unauthorized: wrong Token!"))
    }
}