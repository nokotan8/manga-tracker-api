import { AppError } from "#errors/AppError.js";
import express, { Router } from "express";
import { RowDataPacket } from "mysql2";
import { nanoid } from "nanoid";

const router: Router = express.Router();

/* POST /mangalist */
router.post("/", async (req, res) => {
    if (!req.body.name) {
        throw new AppError(400, "Name not provided");
    }

    const addListQuery = "INSERT INTO MangaLists VALUES(?, ?, ?)";
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

/* GET /mangalist */
router.get("/", async (req, res) => {
    const conn = req.app.locals.conn;
    const getListsQuery = "SELECT Id, Name FROM MangaLists WHERE Owner=?";

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

/* GET /mangalist/all */

/* GET /mangalist/:listId */

/* POST /mangalist/:listId */

/* DELETE /mangalist/:listId/:mangaId */

export default router;
