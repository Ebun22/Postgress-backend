import { Response, Request, RequestHandler, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { prisma } from "..";
import { BadRequestsException } from "../exceptions/bad-request";
import { JWT_SECRET } from "../secrets";
import { SignUpSchema } from "../schema/users";
import { UnprocessableEntity } from "../exceptions/validation";
import { ZodError } from "zod";
import { InternalException } from "../exceptions/internal-exception";
import { NotFoundException } from "../exceptions/not-found";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password } = req.body;
    try {
        SignUpSchema.parse(req.body)
    } catch (err: unknown) {
        if (err instanceof ZodError) {
            throw new UnprocessableEntity("Unprocessable entity", err?.issues)
        } else {
            throw new InternalException("Something went wrong", err)
        }
    }
    
    let user = await prisma.user.findFirst({ where: { email } })
    if (user) {
        throw new BadRequestsException("User already exists!")
    }

    user = await prisma.user.create({
        data: {
            name,
            email,
            password: bcrypt.hashSync(password, 10)
        }
    })
    const { password: hashedPassword, ...userWithoutPassword } = user;

    res.json({ status: 200, success: true, data: { userWithoutPassword } })
    return;
}


//login
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
        throw new NotFoundException("User email not found!")
    }
    const isPasswordCorrect = await bcrypt.compare(password, user!.password)
    if (!isPasswordCorrect) {
        throw new BadRequestsException("Incorrect password")
    }

    const token = jwt.sign({
        userId: user!.id
    }, JWT_SECRET);
    const { password: hashedPassword, ...userWithoutPassword } = user;
    res.json({ success: true, status: 200, data: { ...userWithoutPassword, token } })

    return;
}

//accounts
export const account = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, status: 200, data: { ...req.user } })
    return;
}
