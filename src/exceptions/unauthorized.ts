import { HttpException } from "./root";

export class UnauthorizedException extends HttpException {
    constructor(message: string) {
        super(message, 401, null)
    }
}