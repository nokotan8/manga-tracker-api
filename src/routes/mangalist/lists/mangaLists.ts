import { AppError } from "#errors/AppError.js";
import express, { Router } from "express";
import { RowDataPacket } from "mysql2";
import { nanoid } from "nanoid";

const router: Router = express.Router();

/* POST /mangalist/lists */
router.post("/", async (req, res) => {
    if (!req.body.name) {
        throw new AppError(400, "Name not provided");
    }

    const addListQuery =
        "INSERT INTO MangaLists (Id, Name, Owner) VALUES(?, ?, ?)";
    const conn = req.app.locals.conn;
    const listId = nanoid();

    try {
        await conn.execute(addListQuery, [
            listId,
            req.body.name.trim(),
            res.locals.userId,
        ]);
    } catch (err: any) {
        console.log(err);
        if (err.code === "ER_DUP_ENTRY") {
            throw new AppError(
                400,
                `List with name ${req.body.name} already exists`,
            );
        } else {
            throw new AppError(500, "Database error");
        }
    }

    res.json({ listId: listId });
});

/* GET /mangalist/lists */
router.get("/", async (req, res) => {
    const conn = req.app.locals.conn;
    const getListsQuery =
        "SELECT Id, Name FROM MangaLists WHERE Owner=? ORDER BY DateCreated";

    let [lists, _1] = await conn.execute<RowDataPacket[]>(getListsQuery, [
        res.locals.userId,
    ]);

    const resLists: { id: string; name: string }[] = [];
    for (const list of lists) {
        resLists.push({
            id: list.Id,
            name: list.Name,
        });
    }

    res.json({
        lists: resLists,
    });
});

/* GET /mangalist/lists/all */
router.get("/:listId", async (req, res) => {
    const conn = req.app.locals.conn;
    const listId = req.params.listId;
    let entries: RowDataPacket[] = [];
    let _1;

    try {
        if (listId === "all") {
            const getAllEntriesQuery = `
            SELECT ListEntry.Id as EntryId, Manga.Id as MangaId, TitleEN, TitleJP, Chapters, ChaptersRead, Volumes, VolumesRead, PublicationStatus
            FROM Manga JOIN ListEntry ON Manga.Id = ListEntry.isManga
            WHERE ListEntry.Owner = ?
            ORDER BY ListEntry.DateCreated
            `;

            [entries, _1] = await conn.execute<RowDataPacket[]>(
                getAllEntriesQuery,
                [res.locals.userId],
            );
        } else if (
            listId.toLowerCase() === "reading" ||
            listId.toLowerCase() === "planned" ||
            listId.toLowerCase() === "completed" ||
            listId.toLowerCase() === "dropped"
        ) {
            const getStatusEntriesQuery = `
            SELECT ListEntry.Id as EntryId, Manga.Id as MangaId, TitleEN, TitleJP, Chapters, ChaptersRead, Volumes, VolumesRead, PublicationStatus
            FROM Manga JOIN ListEntry ON Manga.Id = ListEntry.isManga
            WHERE ListEntry.Owner = ? AND ListEntry.ReadStatus = ?
            ORDER BY ListEntry.DateCreated
            `;

            [entries, _1] = await conn.execute<RowDataPacket[]>(
                getStatusEntriesQuery,
                [res.locals.userId, listId.toLowerCase()],
            );
        } else {
            const getListEntriesQuery = `
            SELECT ListEntry.Id as EntryId, Manga.Id as MangaId, TitleEN, TitleJP, Chapters, ChaptersRead, Volumes, VolumesRead, PublicationStatus
            FROM Manga JOIN ListEntry ON Manga.Id = ListEntry.isManga
            JOIN InList ON InList.ListEntry = ListEntry.Id 
            WHERE ListEntry.Owner = ? AND InList.EntryIn = ?
            ORDER BY ListEntry.DateCreated
            `;

            [entries, _1] = await conn.execute<RowDataPacket[]>(
                getListEntriesQuery,
                [res.locals.userId, listId],
            );
        }
    } catch (err) {
        console.log(err);
        throw new AppError(404, "Invalid listId");
    }

    const resEntries = [];
    for (const entry of entries) {
        resEntries.push({
            entryId: entry.EntryId,
            mangaId: entry.MangaId,
            titleEN: entry.TitleEN,
            titleJP: entry.TitleJP,
            chaps: entry.Chapters,
            chapsRead: entry.ChaptersRead,
            vols: entry.Volumes,
            volsRead: entry.VolumesRead,
            pubStatus: entry.PublicationStatus,
        });
    }
    res.json({
        listEntries: resEntries,
    });
});

/* GET /mangalist/lists/:listId */

/* POST /mangalist/lists/:listId */
router.post("/:listId", async (req, res) => {
    const conn = req.app.locals.conn;
    const addToListQuery =
        "INSERT INTO InList (ListEntry, EntryIn) VALUES (?, ?)";

    if (!req.body.listEntry) {
        throw new AppError(404, "No list entry specified");
    }

    try {
        await conn.execute(addToListQuery, [
            req.body.listEntry,
            req.params.listId,
        ]);
    } catch (err) {
        console.log(err);
        throw new AppError(404, "Specified list or list entry does not exist");
    }

    res.json({});
});

/* DELETE /mangalist/lists/:listId/:entryId */
router.delete("/:listId/:entryId", async (req, res) => {
    const conn = req.app.locals.conn;
    const deleteFromListQuery =
        "DELETE FROM InList WHERE EntryIn = ? AND ListEntry = ?";

    try {
        await conn.execute(deleteFromListQuery, [
            req.params.listId,
            req.params.entryId,
        ]);
    } catch (err) {
        console.log(err);
        throw new AppError(404, "Specified list or list entry does not exist");
    }

    res.json({ msg: "success" });
});
export default router;
