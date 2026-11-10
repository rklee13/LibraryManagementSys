import { Response, Request } from "express";
import { registerLibraryCard, findLibraryCard } from "../services/LibraryCardService";

import { ILibraryCard } from "../models/LibraryCard";
import { LibraryCardDoesNotExistError } from "../utils/LibraryErrors";

async function getLibraryCard(req: Request, res: Response) {
    const { cardId } = req.params;

    try {
        let libraryCard = await findLibraryCard(typeof cardId === "string" ? cardId : cardId[0]);
        res.status(200).json({ message: "Retrieved the users's card.", libraryCard });
    } catch (error) {
        if (error instanceof LibraryCardDoesNotExistError) {
            res.status(404).json({ message: "The library card specified does not exist." });
        } else {
            res.status(500).json({ message: "Unable to retrieve user's library card.", error });
        }
    }
}

async function createLibraryCard(req: Request, res: Response) {
    const card: ILibraryCard = req.body;

    try {
        let libraryCard = await registerLibraryCard(card);
        res.status(201).json({ message: "Generated library card for user.", libraryCard });
    } catch (error) {
        res.status(500).json({ message: "Unable to create library card at this time.", error });
    }
}

export default { getLibraryCard, createLibraryCard };