import { Response, Request, RequestHandler, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";
import crypto from 'crypto';
import { prisma } from "..";
import { BadRequestsException } from "../exceptions/bad-request";
import {  JWT_SECRET } from "../secrets";
// GMAIL_PASSWORD, GMAIL_USER,
import { SignUpSchema } from "../schema/users";
import { UnprocessableEntity } from "../exceptions/validation";
import { ZodError } from "zod";
import { InternalException } from "../exceptions/internal-exception";
import { NotFoundException } from "../exceptions/not-found";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, number, password } = req.body;

    //handling Zod error in my errorHandling function
    SignUpSchema.parse(req.body);

    let user = await prisma.user.findFirst({ where: { email } })
    if (user) {
        throw new BadRequestsException("User already exists!")
    }

    user = await prisma.user.create({
        data: {
            name,
            email,
            number,
            password: bcrypt.hashSync(password, 10)
        }
    })
    const { password: hashedPassword, ...userWithoutPassword } = user;

    res.json({ status: 200, success: true, data: { ...userWithoutPassword } })
    return;
}


//login
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    let user = await prisma.user.findFirst({ where: { email } });
    console.log("this is user: ")

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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
//     //take in new password and confirm password

//     //verify that user email sent exists
//     const user = await prisma.user.findFirst({ where: { email: req.body.email } });
//     if (!user) {
//         throw new NotFoundException("User with given email doesn't exist")
//     }

//      //generate token
//      const resetToken = crypto.randomBytes(32).toString('hex')

//     //send email of token to the user's email
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: false, // true for port 465, false for other ports
//         auth: {
//             user: GMAIL_USER,
//             pass: GMAIL_PASSWORD,
//         },
//     });

//     try {
//         const info = await transporter.sendMail({
//             from: '"Baddie at Arimax 👻" <maddison53@ethereal.email>', // sender address
//             to: user.email, // list of receivers
//             subject: "Password Reset", // Subject line
//             text: "Hello, you clicked to reset your password", // plain text body
//             html: "<b>Hello world?</b>", // html body
//         });
//         console.log("Message sent: %s", info.messageId);
//     } catch (err) {
//         console.log("This is error why mail no send: ", err)
//     }

    // const { oldPassword, newPassword } = req.body;
    // const user = await prisma.user.findFirst({ where: { id: req.user.id } });

    // if (!user) {
    //     throw new NotFoundException("User not found")
    // }

    // const isPasswordCorrect = await bcrypt.compare(oldPassword, user!.password)
    // if (!isPasswordCorrect) {
    //     throw new BadRequestsException("Incorrect password")
    // }

    // const hashedPassword = bcrypt.hashSync(newPassword, 10);
    // await prisma.user.update({
    //     where: { id: req.user.id },
    //     data: { password: hashedPassword }
    // })

    // res.json({ success: true, status: 200, message: "Password updated successfully" })
    // return;
}

