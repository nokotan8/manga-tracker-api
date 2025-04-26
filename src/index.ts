import express, { Request, Response } from 'express';
import auth from '#routes/auth.js';
const app = express();
const port = '9292';

app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware
});

app.get('/', (req: Request, res: Response) => {});

app.use('/auth', auth);

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
