// /auth
import express, { Request, Response, Router } from 'express';
import { body, Result, validationResult } from 'express-validator';

const router: Router = express.Router();

router.post(
    '/login',
    body('username')
        .isLength({ min: 4, max: 20 })
        .withMessage('Username must be between 4 and 20 characters'),
    body('password')
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
    (req: Request, res: Response) => {
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result.formatWith((error) => error.msg as string).array(),
            });
            return;
        }
        res.json({ token: 'jwt here' });
    },
);

router.post('/register', (req: Request, res: Response) => {
    try {
        res.json({ token: 'jwt here' });
    } catch {}
});

export default router;
