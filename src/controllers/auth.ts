import { Response, Request, RequestHandler, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";
import crypto from 'crypto';
import { prisma } from "..";
import { BadRequestsException } from "../exceptions/bad-request";
import { GMAIL_PASSWORD, GMAIL_USER, JWT_SECRET } from "../secrets";
import { SignUpSchema, UpdatePasswordSchema } from "../schema/users";
import { UnprocessableEntity } from "../exceptions/validation";
import { ZodError } from "zod";
import { InternalException } from "../exceptions/internal-exception";
import { NotFoundException } from "../exceptions/not-found";
import { generateToken } from "../utils/generateToken";
import { emailSender } from "../utils/sendEmail";
import { Token, User } from "@prisma/client";
import { createJWTToken } from "../utils/createJWTToken";

interface TokenWithUser extends Token {
    user: User;
}

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

    const token = await createJWTToken(user, res)
    return token;
}

// send otp route
export const getOTP = async (req: Request, res: Response, next: NextFunction) => {
    //verify that user email sent exists
    const user = await prisma.user.findFirst({ where: { email: req.body.email } });
    if (!user) {
        throw new NotFoundException("User with given email doesn't exist")
    }

    const token = generateToken();
    console.log("this is token: ", token)
    const resetToken = crypto.createHash('sha256').update(token.toString()).digest('hex');

    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // expires in 10 mins

    await prisma.token.create({
        data: {
            token: resetToken,
            expiredAt: new Date(resetTokenExpiry),
            userId: user.id
        }
    })

    //send email of token to the user's email
    try {
        const result = await emailSender(req, user.email, "OTP Login", 'OTPLogin', token)
        if (result === "sent") return res.json({ status: 200, success: true, message: "email successfully sent to user" });
    } catch (err) {
        throw new BadRequestsException("Error while sending email")
    }
}

//OTP LOGIN 
export const OTPLogin = async (req: Request, res: Response, next: NextFunction) => {
    let token: TokenWithUser;
    const otp = req.body.OTP

    //get the reset token from body & encrypt it
    const resetToken = crypto.createHash('sha256').update(otp.toString()).digest('hex')

    //find a user who matches that token & check if the token is expired: expiredAt > new date now
    try {
        token = await prisma.token.findFirstOrThrow({
            where: {
                token: resetToken
            },
            include: {
                user: true
            }
        })

        if (token) {
            const authToken = await createJWTToken(token.user, res)
            return authToken;
        }
    } catch (err) {
        console.log(err)
        throw new UnprocessableEntity("Token is invalid or expired", err)
    }
}


export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {

    //verify that user email sent exists
    const user = await prisma.user.findFirst({ where: { email: req.body.email } });
    if (!user) {
        throw new NotFoundException("User with given email doesn't exist")
    }

    //generate token
    const generateToken = () => {
        const buffer = crypto.randomBytes(2);
        const randomValue = buffer.readUInt16BE(0);
        return 1000 + (randomValue % 9000)
    }

    const token = generateToken();
    console.log("this is token: ", token)
    const resetToken = crypto.createHash('sha256').update(token.toString()).digest('hex');

    const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // expires in 10 mins

    await prisma.token.create({
        data: {
            token: resetToken,
            expiredAt: new Date(resetTokenExpiry),
            userId: user.id
        }
    })

    //send email of token to the user's email
    try {
        const result = await emailSender(req, user.email, "Password Reset", 'resetPassword', token)
        if (result === "sent") return res.json({ status: 200, success: true, message: "email successfully sent to user" });
    } catch (err) {
        throw new BadRequestsException("Error while sending email")
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    let token: TokenWithUser;
    const newPassword = req.body.password

    const validatePassword = UpdatePasswordSchema.parse(newPassword)
    //get the reset token from param & encrypt it
    const resetToken = crypto.createHash('sha256').update((req.params.token).toString()).digest('hex')

    //find a user who matches that token and check if the token is expired: expiredAt > new date now
    try {
        token = await prisma.token.findFirstOrThrow({
            where: {
                token: resetToken
            },
            include: {
                user: true
            }
        })
    } catch (err) {
        console.log(err)
        throw new UnprocessableEntity("Token is invalid or expired", err)
    }

    if (token) {
        const userId = token.user.id

        //get user and update user password
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data: { password: bcrypt.hashSync(validatePassword as string, 10) }
            })

            if (user) {
                //delete token once password is reset
                await prisma.token.delete({ where: { id: token.id } })

                //log user in instantly
                const authToken = await createJWTToken(token.user, res)
                return authToken;
            }
        } catch (err) {
            throw new BadRequestsException("Error changing password")
        }
    }

}

