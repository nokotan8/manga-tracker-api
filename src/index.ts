import express from 'express';
const router = express.Router();
const app = express();
const port = '9292';

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware
});

app.get('/', (req, res) => {
    res.send('asdf');
});
app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
