import { AppError } from "#errors/AppError.js";
import express, { Router, Request, Response } from "express";
import { body, Result, validationResult } from "express-validator";
import { RowDataPacket } from "mysql2";
import { nanoid } from "nanoid";

const router: Router = express.Router();

/* POST /mangalist/manga */
router.post(
    "/",
    body("mangaId").notEmpty(),
    body("score").if(body("score").notEmpty()).isInt({ min: 0, max: 10 }),
    body("readStatus").notEmpty(),
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
        const entryId = nanoid();
        const addListEntryQuery = `
            INSERT INTO ListEntry (Id, IsManga, Owner, ChaptersRead, VolumesRead, ReadStatus, Score, Notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        try {
            await conn.execute(addListEntryQuery, [
                entryId,
                req.body.mangaId,
                res.locals.userId,
                req.body.chapsRead || null,
                req.body.volsRead || null,
                req.body.readStatus,
                req.body.score || null,
                req.body.notes || null,
            ]);
        } catch (err) {
            console.log(err);
            throw new AppError(404, "Specified mangaId does not exist");
        }

        res.json({ entryId: entryId });
    },
);

/* GET /mangalist/manga/:entryId */
router.get("/:entryId", async (req, res) => {
    const conn = req.app.locals.conn;
    const getListEntryQuery = `
        SELECT Manga.Id as MangaId, TitleEN, TitleJP, ChaptersRead, VolumesRead, ReadStatus, Score, Notes
        FROM Manga JOIN ListEntry ON Manga.Id = ListEntry.isManga
        WHERE ListEntry.Id = ? AND ListEntry.Owner = ?
    `;
    const getListEntryListsQuery = `
        SELECT EntryIn FROM InList
        WHERE ListEntry = ?
    `;

    let [entries, _1] = await conn.execute<RowDataPacket[]>(getListEntryQuery, [
        req.params.entryId,
        res.locals.userId,
    ]);

    if (entries.length != 1) {
        throw new AppError(404, "Specified entry does not exist");
    }

    let [lists, _2] = await conn.execute<RowDataPacket[]>(
        getListEntryListsQuery,
        [req.params.entryId],
    );

    res.json({
        entry: {
            mangaId: entries[0].MangaId,
            titleEN: entries[0].TitleEN,
            titleJP: entries[0].TitleJP,
            chapsRead: entries[0].ChaptersRead,
            volsRead: entries[0].VolumesRead,
            readStatus: entries[0].ReadStatus,
            score: entries[0].Score,
            notes: entries[0].Notes,
        },
        lists: lists.map((list) => list.EntryIn),
    });
});

/* PUT /mangalist/manga/:entryId */
router.put(
    "/:entryId",
    body("chapsRead").if(body("chapsRead").notEmpty()).isInt(),
    body("volsRead").if(body("volsRead").notEmpty()).isInt(),
    body("score").if(body("score").notEmpty()).isInt({ min: 0, max: 10 }),
    body("readStatus").notEmpty(),
    async (req: Request, res: Response) => {
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
        const updateEntryQuery = `
            UPDATE ListEntry
            SET ChaptersRead = ?, VolumesRead = ?, ReadStatus = ?, Score = ?, Notes = ?
            WHERE Id = ? AND Owner = ?
        `;

        try {
            await conn.execute(updateEntryQuery, [
                req.body.chapsRead,
                req.body.volsRead,
                req.body.readStatus,
                req.body.score,
                req.body.notes,
                req.params.entryId,
                res.locals.userId,
            ]);
        } catch (err) {
            console.log(err);
            throw new AppError(404, "Specified entry does not exist");
        }

        res.json({ msg: "success" });
    },
);

/* DELETE /mangalist/manga/:entryId */

export default router;
