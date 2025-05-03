import { AppError } from "#errors/AppError.js";
import { Request, Response, NextFunction } from "express";
import { header, Result, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

export const validateToken = [
    header("authorization")
        .contains("Bearer ")
        .withMessage("Authorization header must be in format Bearer <token>"),

    (req: Request, res: Response, next: NextFunction) => {
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result
                    .formatWith((error) => error.msg as string)
                    .array(),
            });
            return;
        }
        const authHeader = (req.headers.authorization as string).split(" ")[1];
        try {
            jwt.verify(authHeader, process.env.JWT_SECRET);
        } catch {
            throw new AppError(404, "Invalid JWT");
        }

        next();
    },
];
