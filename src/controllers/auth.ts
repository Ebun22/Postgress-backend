import { Response, Request, RequestHandler, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { prisma } from "..";
import { BadRequestsException } from "../exceptions/bad-request";
import { JWT_SECRET } from "../secrets";
import { SignUpSchema } from "../schema/users";
import { UnprocessableEntity } from "../exceptions/validation";
import { HttpException } from "../exceptions/root";

export const signup: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, name, password } = req.body;

        SignUpSchema.parse(req.body)
        let user = await prisma.user.findFirst({ where: { email } })
        if (user) {
            next(new BadRequestsException("User already exists!", 422))
        }

        user = await prisma.user.create({
            data: {
                name,
                email,
                password: bcrypt.hashSync(password, 10)
            }
        })
        const { password: hashedPassword, ...userWithoutPassword } = user;

        res.json({ status: 200, success: true, data: { userWithoutPassword } });
        return;
    } catch (err: any) {
        next(new UnprocessableEntity("unprocessable entity", err?.issues))
    }
}

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    let user = await prisma.user.findFirst({ where: { email } });
    // console.log("password comparison: ", bcrypt.compare(password, user!.password))
    if (!user) {
        next(new BadRequestsException("User email does not exist!", 404))
        return;
    }
    const isPasswordCorrect = await bcrypt.compare(password, user!.password)
    if (!isPasswordCorrect) {
        next(new BadRequestsException("user password is incorrect", 405))
        return;
    }
    const token = jwt.sign({
        userId: user!.id
    }, JWT_SECRET)
    res.json({ success: true, status: 200, data: { ...user, token } })
    return;
}
