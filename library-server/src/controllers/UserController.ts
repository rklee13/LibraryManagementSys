import { Response, Request } from "express";
import { findAllUsers, findUserById, removeUser, modifyUser } from "../services/UserService";
import { UserDoesNotExistError } from "../utils/LibraryErrors";

async function getAllUsers(req: Request, res: Response) {
    try {
        let users = await findAllUsers();
        res.status(200).json({ message: "All users retrieved succesfully.", users });
    } catch (error: any) {
        res.status(500).json({ message: "Unable to retrieve users at this time.", error: error.message });
    }
}

async function getUserById(req: Request, res: Response) {
    const userId = req.params.userId;
    try {
        let user = await findUserById(typeof userId === "string" ? userId : userId[0]);
        res.status(200).json({ message: "User found succesfully.", user });
    } catch (error: any) {
        if (error instanceof UserDoesNotExistError) {
            res.status(404).json({ message: "user requested does not exist." });
        } else {
            res.status(500).json({ message: "Could not find user.", error: error.message });
        }
    }
}

async function updateUser(req: Request, res: Response) {
    const user = req.body;
    try {
        let updatedUser = await modifyUser(user);
        res.status(202).json({ message: "User updated succesfully.", user: updatedUser });
    } catch (error: any) {
        if (error instanceof UserDoesNotExistError) {
            res.status(404).json({ message: "user requested does not exist." });
        } else {
            res.status(500).json({ message: "Unable to update user at this time.", error: error.message });
        }
    }
}

async function deleteUser(req: Request, res: Response) {
    const userId = req.params.userId;
    try {
        await removeUser(typeof userId === "string" ? userId : userId[0]);
        res.status(202).json({ message: "User deleted succesfully." });
    } catch (error: any) {
        if (error instanceof UserDoesNotExistError) {
            res.status(404).json({ message: "user requested does not exist." });
        } else {
            res.status(500).json({ message: "Unable to delete user at this time.", error: error.message });
        }
    }
}

export default { getAllUsers, getUserById, updateUser, deleteUser }