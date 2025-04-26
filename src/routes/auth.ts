import express, { Request, Response, Router } from 'express';
import { body, Result, validationResult } from 'express-validator';

const router: Router = express.Router();

/* /auth/register */
router.post(
    '/register',
    body('username')
        .isLength({ min: 4, max: 20 })
        .withMessage('Username must be between 4 and 20 characters'),
    body('password')
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
    (req, res) => {
        const result: Result = validationResult(req);
        if (result.isEmpty()) {
            res.json({ token: 'jwt here' });
        } else {
            res.status(400).json({
                errors: result.formatWith((error) => error.msg as string).array(),
            });
        }
    },
);

/* /auth/login */
router.post(
    '/login',
    body('username')
        .isLength({ min: 4, max: 20 })
        .withMessage('Username must be between 4 and 20 characters'),
    body('password')
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
    (req, res) => {
        const result: Result = validationResult(req);
        if (result.isEmpty()) {
            res.json({ token: 'jwt here' });
        } else {
            res.status(400).json({
                errors: result.formatWith((error) => error.msg as string).array(),
            });
        }
    },
);

export default router;
