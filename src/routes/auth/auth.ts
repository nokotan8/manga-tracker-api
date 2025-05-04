import { AppError } from "#errors/AppError.js";
import express, { Router } from "express";
import { body, matchedData, Result, validationResult } from "express-validator";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const router: Router = express.Router();

// const getUsernameQuery = "SELECT * FROM Users WHERE Username = ?";
const getUserQuery = "SELECT Username, Password FROM Users WHERE Username = ?";
const addUserQuery = "INSERT INTO Users Values (?, ?, ?)";

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
        ]);
        if (users.length != 1) {
            throw new AppError(403, "Incorrect username or password");
        }

        if (await argon2.verify(users[0].Password, data.password)) {
            res.json({
                token: jwt.sign(
                    { username: data.username },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "7d",
                    },
                ),
            });
        } else {
            throw new AppError(403, "Incorrect username or password");
        }
    },
);

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

        try {
            let [_resHeaders, _1] = await conn.execute<ResultSetHeader>(
                addUserQuery,
                [nanoid(), data.username, await argon2.hash(data.password)],
            );
        } catch (err: any) {
            console.log(err);
            if (err.code === "ER_DUP_ENTRY") {
                throw new AppError(400, "Username already exists");
            } else {
                throw new AppError(500, "Database error");
            }
        }

        res.json({
            token: jwt.sign(
                { username: data.username },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d",
                },
            ),
        });
    },
);
export default router;
