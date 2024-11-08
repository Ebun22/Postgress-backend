import { NextFunction, Request, Response } from "express"
import { HttpException } from "../exceptions/root"

export const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    res.status(error.statusCode).json({
        success: false,
        statusCode: error.statusCode || 500,
        data: {
            message: error.message || "An Error has occured",
            error: error.error
        }
    })
}