import { HttpException } from "./root"

export class UnprocessableEntity extends HttpException {
    constructor(message: string, error: any) {
        super(message, 422, error)
    }
}
