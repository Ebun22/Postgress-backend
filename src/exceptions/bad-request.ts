import { HttpException } from "./root";

export class BadRequestsException extends HttpException {
    constructor(message: string, statusCode: number){
        super(message, statusCode, null)
    }
}