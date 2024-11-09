import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { UnprocessableEntity } from "../exceptions/validation";
import { InternalException} from "../exceptions/internal-exception";
import { ProductSchema } from "../schema/products";

export const createProducts = (req: Request, res: Response, next: NextFunction) => {
    //validation in try catch
    try {
        ProductSchema.parse(req.body)
    } catch (err) {
        if (err instanceof ZodError) {
            throw new UnprocessableEntity("Unprocessable entity", err?.issues)
        } else {
            throw new InternalException("Something went wrong", err)
        }
    }
    //pass req.body as data
}