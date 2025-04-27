import express, { Router } from "express";
import { body, matchedData, Result, validationResult } from "express-validator";

const router: Router = express.Router();

const getUsernameQuery = "SELECT * FROM Users WHERE Username = ?";
const getUserQuery = "SELECT * FROM Users WHERE Username = ? AND Password = ?";
const addUserQuery = "INSERT INTO Users (Username, Password) Values (?, ?)";

/* /auth/register */
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
        if (result.isEmpty()) {
            res.json({ token: "jwt here" });
        } else {
            res.status(400).json({
                errors: result.formatWith((error) => error.msg as string).array(),
            });
        }
    },
);

/* /auth/login */
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
        if (result.isEmpty()) {
            let [results, fields] = await conn.execute(getUsernameQuery, [data.username]);
            res.json({ token: "jwt here" });
        } else {
            res.status(400).json({
                errors: result.formatWith((error) => error.msg as string).array(),
            });
        }
    },
);

export default router;
