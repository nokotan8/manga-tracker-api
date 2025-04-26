import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

// POST /auth/register
router.post('/register', (req: Request, res: Response) => {
    try {
        res.json({ token: 'jwt here' });
    } catch {}
});

export default router;
