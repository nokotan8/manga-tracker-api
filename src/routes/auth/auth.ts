import { AppError } from "#errors/AppError.js";
import express, { Router } from "express";
import { body, matchedData, Result, validationResult } from "express-validator";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

const router: Router = express.Router();

// const getUsernameQuery = "SELECT * FROM Users WHERE Username = ?";
const getUserQuery = "SELECT * FROM Users WHERE Username = ? AND Password = ?";
const addUserQuery = "INSERT INTO Users (Username, Password) Values (?, ?)";

/* POST /auth/register */
router.post(
    "/register",
    body("username")
        .isLength({ min: 4, max: 20 })
        .withMessage("Username must be between 4 and 20 characters"),
    body("password")
        .isLength({ min: 4, max: 20 })
        .withMessage("Password must be between 4 and 20 characters"),
    async (req, res) => {
        const result: Result = validationResult(req);
        const data = matchedData(req);
        const conn = req.app.locals.conn;
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result
                    .formatWith((error) => error.msg as string)
                    .array(),
            });
        }
        let [users, _1] = await conn.execute<RowDataPacket[]>(getUserQuery, [
            data.username,
            argon2.hash(data.password),
        ]);

        if (users.length != 1) {
            throw new AppError(404, "User not found");
        }

        res.json({
            token: jwt.sign(
                { username: data.username },
                process.env.JWT_TOKEN,
                {
                    expiresIn: "7d",
                },
            ),
        });
    },
);

/* POST /auth/login */
router.post(
    "/login",
    body("username")
        .isLength({ min: 4, max: 20 })
        .withMessage("Username must be between 4 and 20 characters"),
    body("password")
        .isLength({ min: 4, max: 20 })
        .withMessage("Password must be between 4 and 20 characters"),
    async (req, res) => {
        const data = matchedData(req);
        const result: Result = validationResult(req);
        const conn = req.app.locals.conn;
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result
                    .formatWith((error) => error.msg as string)
                    .array(),
            });
        }

        let [resHeaders, _1] = await conn.execute<ResultSetHeader>(
            addUserQuery,
            [data.username, argon2.hash(data.password)],
        );
        if (!resHeaders.affectedRows) {
            throw new AppError(409, "User already exists");
        }

        res.json({
            token: jwt.sign(
                { username: data.username },
                process.env.JWT_TOKEN,
                {
                    expiresIn: "7d",
                },
            ),
        });
    },
);
export default router;
