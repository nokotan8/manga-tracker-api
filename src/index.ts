import express, { ErrorRequestHandler, NextFunction } from "express";
import mysql, { ConnectionOptions } from "mysql2/promise";
import cors from "cors";
import auth from "#routes/auth.js";

const app = express();
const port = "9292";

const access: ConnectionOptions = {
    socketPath: "/var/run/mysqld/mysqld.sock",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

app.locals.conn = await mysql.createConnection(access);

app.use(
    cors({
        origin: "http://127.0.0.1:9291",
        optionsSuccessStatus: 200,
    }),
);
app.use(express.json());

app.use((req, res, next) => {
    console.log(
        `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl} ${res.statusCode}`,
    );
    next();
});

app.use("/auth", auth);

app.use((req, res) => {
    // Unmatched route
    res.status(404).json({ errors: [`Route ${req.url} does not exist`] });
});

app.use(((err, req, res, next) => {
    console.log(err.message);
    if (err instanceof SyntaxError) {
        res.status(400).json({ errors: ["Invalid JSON"] });
    } else {
        res.status(500).json({ message: "Internal server error" });
    }
}) as ErrorRequestHandler);

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
