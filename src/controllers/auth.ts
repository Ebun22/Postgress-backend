import { Response, Request, RequestHandler } from "express";
import bcrypt from "bcrypt";
import { prisma } from "..";

export const signup: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, name, password } = req.body;

    let user = await prisma.user.findFirst({ where: { email } })
    if (user) {
       res.json({
            status: 422,
            success: false,
            data: {
                error: "Unprocessable Content", message: "User already exists!"
            }
        });
        // throw Error("User already exists!")
        return;
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
    return ;
}

export const Login = (req: Request, res: Response) => {
    res.send("Login is working");
}
