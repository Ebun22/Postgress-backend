import { HttpException } from "./root";

export class BadRequestsException extends HttpException {
    constructor(message: string){
        super(message, 422, null)
    }
}