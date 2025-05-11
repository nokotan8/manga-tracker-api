import { AppError } from "#errors/AppError.js";
import express, { Router } from "express";
import { body, Result, matchedData, validationResult } from "express-validator";
import { ResultSetHeader } from "mysql2";
import { nanoid } from "nanoid";

const router: Router = express.Router();

/* POST /manga */
router.use(
    "/",
    body("titleJP")
        .isString()
        .notEmpty()
        .withMessage("Manga must have JP title"),
    body("pubStatus")
        .isString()
        .notEmpty()
        .withMessage("Manga must have a publication status"),
    body("genres").isArray().withMessage("Genres must be an array"),
    body("year").isInt({ min: 0, max: 9999 }).withMessage("Enter a valid year"),
    body("isPublic").isBoolean().withMessage("Public status must exist"),

    async (req, res) => {
        const result: Result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result
                    .formatWith((error) => error.msg as string)
                    .array(),
            });
            return;
        }
        const conn = req.app.locals.conn;
        const addMangaQuery =
            "INSERT INTO Manga Values (?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)";
        const addGenreQuery =
            "INSERT INTO Genres (Genre, MangaId) Values (?, ?)";

        const mangaId = nanoid();
        try {
            let [_resHeaders, _1] = await conn.execute<ResultSetHeader>(
                addMangaQuery,
                [
                    mangaId,
                    req.body.titleEN.trim() || null,
                    req.body.titleJP.trim(),
                    req.body.authorEN.trim() || null,
                    req.body.authorJP.trim() || null,
                    req.body.year,
                    res.locals.userId,
                    req.body.chapsTotal || null,
                    req.body.volsTotal || null,
                    req.body.pubStatus.trim(),
                    req.body.isPublic,
                ],
            );

            const genres: string[] = req.body.genres;
            if (genres.length) {
                for (const genre of genres) {
                    if (genre.trim()) {
                        await conn.execute(addGenreQuery, [
                            genre.trim(),
                            mangaId,
                        ]);
                    }
                }
            }
        } catch (error) {
            throw new AppError(500, "DB Error");
        }

        res.json({ mangaId: mangaId });
    },
);

/* GET /manga?filters= */

/* GET /manga/:mangaid */

/* PUT /manga/:mangaid */

/* DELETE /manga/:mangaid */
export default router;
