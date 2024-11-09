import { HttpException } from "./root";

export class InternalException extends HttpException{
    constructor(message: string, error: any){
        super(message, 500, error)
    }
}