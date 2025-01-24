import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../secrets";
import { Response, Request } from "express";
import { User } from "@prisma/client";

export const createJWTToken = async (user: User,  res: Response) => {
       const token = jwt.sign({
            userId: user!.id
        }, JWT_SECRET);
    
        const { password: hashedPassword, ...userWithoutPassword } = user;
    
        return res.json({ success: true, status: 200, data: { ...userWithoutPassword, token } })
 }
