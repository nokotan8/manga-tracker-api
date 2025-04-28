export class AppError extends Error {
    status: number = 500;
    constructor(code: number, msg: string) {
        super(msg);
        this.status = code;
    }
}
