import { Request, Response, NextFunction } from "express";
import { HttpException } from "./root";

export class NotFoundException extends HttpException {
    constructor(message: string){
        super(message, 404, null)
    }
}