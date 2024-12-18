import { Request, Response, NextFunction } from "express";
import { HttpException } from "./exceptions/root";
import { InternalException } from "./exceptions/internal-exception";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client"
import { UnprocessableEntity } from "./exceptions/validation";
import { NotFoundException } from "./exceptions/not-found";

export const errorHandler = (method: { (req: Request, res: Response, next: NextFunction): Promise<Response<any> | void> }) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next)
        } catch (err) {
            let exception: HttpException
            if (err instanceof HttpException) {
                exception = err
            } else {
                if (err instanceof ZodError) {
                    exception = new UnprocessableEntity("Unprocessable entity", err?.issues)
                } else if (err instanceof Prisma.PrismaClientValidationError) {
                    console.log("This is error in zod: ", err)
                    exception = new UnprocessableEntity("Unprocessable entity: enter valid paramters", err)
                } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
                    console.log("This is err in exception: ", err)
                    exception = new NotFoundException("Invalid : Id doesn't exist")
                } else if (typeof err === "object" && err !== null && "type" in err) {
                    const stripeError = err as { type: string; raw: any; param: string };
                    if (stripeError.type === "StripeInvalidRequestError") {

                        exception = new InternalException("StripeInvalidRequestError", {message: err})
                    }

                }
                exception = new InternalException("Something went wrong!", err)
            }
            next(exception)
        }
    }
}