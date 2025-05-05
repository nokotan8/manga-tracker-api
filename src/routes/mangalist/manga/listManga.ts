import { AppError } from "#errors/AppError.js";
import express, { Router } from "express";
import { body, Result, validationResult } from "express-validator";
import { nanoid } from "nanoid";

const router: Router = express.Router();

/* POST /mangalist/manga */
router.post(
    "/",
    body("mangaId").notEmpty(),
    body("chapsRead").if(body("chapsRead").exists()).isInt(),
    body("volsRead").if(body("volsRead").exists()).isInt(),
    body("score").if(body("score").exists()).isInt({ min: 0, max: 10 }),
    body("readStatus").notEmpty(),

    (req, res) => {
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
        const entryId = nanoid();
        const addListEntryQuery = `
            INSERT INTO ListEntry (Id, IsManga, Owner, ChaptersRead, VolumesRead, ReadStatus, Score, Notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        try {
            conn.execute(addListEntryQuery, [
                entryId,
                req.body.mangaId,
                res.locals.userId,
                req.body.chapsRead || null,
                req.body.volsRead || null,
                req.body.readStatus,
                req.body.score || null,
                req.body.notes || null,
            ]);
        } catch (error) {
            console.log(error);
            throw new AppError(404, "Bad info");
        }

        res.json({ entryId: entryId });
    },
);

/* GET /mangalist/manga/:mangaId */

/* PUT /mangalist/manga/:mangaId */

/* DELETE /mangalist/manga/:mangaId */

export default router;
