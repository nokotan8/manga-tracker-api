import express, { ErrorRequestHandler } from "express";
import mysql, { ConnectionOptions } from "mysql2/promise";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import auth from "#routes/auth/auth.js";
import manga from "#routes/manga/manga.js";
import listManga from "#routes/mangalist/manga/listManga.js";
import mangaLists from "#routes/mangalist/lists/mangaLists.js";
import { AppError } from "#errors/AppError.js";
import { validateToken } from "#routes/auth/verifyToken.js";

const app = express();
const port = "9292";

const swaggerOpts = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Manga Tracker API",
            version: "0.1.0",
            description:
                "REST API for tracking users' manga reading progress and add them into predefined and custom lists",
        },
        servers: [
            {
                url: "http://localhost:9292",
            },
        ],
    },
    apis: ["./routes/**/*.{js,ts}"],
};

const access: ConnectionOptions = {
    socketPath: "/var/run/mysqld/mysqld.sock",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

app.locals.conn = await mysql.createConnection(access);

// Allow frontend
app.use(
    cors({
        origin: "http://localhost:9291",
        optionsSuccessStatus: 200,
    }),
);
app.use(express.json());

/* Logging */
app.use((req, res, next) => {
    console.log(
        `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl} ${res.statusCode}`,
    );
    next();
});

const spec = swaggerJsdoc(swaggerOpts);
app.get("/", (_req, res) => {
    res.redirect("/docs");
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));

/* Login/register routes */
app.use("/auth", auth);

/* Validate JWT for all other routes */
app.use(validateToken);

app.use("/manga", manga);

app.use("/mangalist/manga", listManga);

app.use("/mangalist/lists", mangaLists);

app.use((req, res) => {
    // Unmatched route
    res.status(404).json({
        errors: [`Route ${req.method} ${req.url} does not exist`],
    });
});

app.use(((err, _req, res, _next) => {
    console.log(err);
    if (err instanceof SyntaxError) {
        res.status(400).json({ errors: ["Invalid JSON"] });
        return;
    } else if (err instanceof AppError) {
        res.status(err.status).json({ errors: [err.message] });
        return;
    } else {
        res.status(500).json({ errors: ["Internal server error"] });
        return;
    }
}) as ErrorRequestHandler);

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
