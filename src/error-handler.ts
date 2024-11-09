import { Request, Response, NextFunction} from "express";
import { HttpException } from "./exceptions/root";
import { InternalException } from "./exceptions/internal-exception";

export const errorHandler = (method: { (req: Request, res: Response, next: NextFunction): Promise<void>}) => {
    return async (req: Request, res: Response, next: NextFunction)=> {
        try {
            await method(req, res, next)
        } catch (err) {
            let exception: HttpException
            if (err instanceof HttpException) {
                exception = err
            } else {
                exception = new InternalException("Something went wrong!", err)
            }
            next(exception)
        }
    }
}