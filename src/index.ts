import express, { ErrorRequestHandler, NextFunction } from 'express';
import auth from '#routes/auth.js';

const app = express();
const port = '9292';

app.use(express.json());

app.use((req, res, next) => {
    console.log(
        `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl} ${res.statusCode}`,
    );
    next();
});

app.use('/auth', auth);

app.use((req, res) => {
    // Unmatched route
    res.status(404).json({ errors: [`Route ${req.url} does not exist`] });
});

app.use(((err, req, res, next) => {
    console.log(err.message);
    if (err instanceof SyntaxError) {
        return res.status(400).json({ errors: ['Invalid JSON'] });
    }

    res.status(500).json({ message: 'Internal server error' });
}) as ErrorRequestHandler);

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
