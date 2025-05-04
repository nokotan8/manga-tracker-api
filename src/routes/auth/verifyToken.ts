import { AppError } from "#errors/AppError.js";
import { Request, Response, NextFunction } from "express";
import { header, Result, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export const validateToken = [
    header("authorization")
        .contains("Bearer ")
        .withMessage("Authorization header must be in format Bearer <token>"),

    async (req: Request, res: Response, next: NextFunction) => {
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result
                    .formatWith((error) => error.msg as string)
                    .array(),
            });
            return;
        }
        const token = (req.headers.authorization as string).split(" ")[1];
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            let username = JSON.parse(atob(token.split(".")[1])).username;
            const conn = req.app.locals.conn;
            const getUserQuery = "SELECT Id FROM Users WHERE Username = ?";
            let [users, _1] = await conn.execute<RowDataPacket[]>(
                getUserQuery,
                [username],
            );
            if (users.length != 1) {
                throw new AppError(403, "Username does not exist");
            }

            res.locals.userId = users[0].Id;
        } catch (error: any) {
            throw new AppError(401, "Invalid JWT");
        }

        next();
    },
];
