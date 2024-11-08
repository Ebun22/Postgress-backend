//passing in message, status code, errors

export class HttpException extends Error {
    message: string;
    statusCode: number;
    error: any;

    constructor(message: string, statusCode:number, error: any){
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.error = error
    }
}
