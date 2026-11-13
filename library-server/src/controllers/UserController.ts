import { Response, Request } from "express";
import { createManagedUser, findAllUsers, findUserById, removeUser, modifyUser } from "../services/UserService";
import { CannotDeleteOwnAccountError, UserAlreadyExistsError, UserDoesNotExistError } from "../utils/LibraryErrors";
import { IUser } from "../models/User";

function userProfile(user: { _id: unknown; type: IUser['type']; email: string; firstName: string; lastName: string }) {
    return {
        _id: user._id,
        type: user.type,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    };
}

async function getAllUsers(req: Request, res: Response) {
    try {
        const users = (await findAllUsers()).map(userProfile);
        res.status(200).json({ message: "All users retrieved succesfully.", users });
    } catch (error: any) {
        res.status(500).json({ message: "Unable to retrieve users at this time.", error: error.message });
    }
}

async function getUserById(req: Request, res: Response) {
    const userId = req.params.userId;
    try {
        const user = await findUserById(typeof userId === "string" ? userId : userId[0]);
        res.status(200).json({ message: "User found succesfully.", user: userProfile(user) });
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
    if (req.authenticatedUser?._id.toString() !== user._id) {
        res.status(403).json({ message: 'You may only update your own account.' });
        return;
    }
    try {
        const updatedUser = await modifyUser(user);
        res.status(202).json({ message: "User updated succesfully.", user: userProfile(updatedUser) });
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
    const requestingUserId = req.authenticatedUser?._id.toString();
    if (!requestingUserId) {
        res.status(401).json({ message: 'Authentication is required.' });
        return;
    }
    try {
        await removeUser(typeof userId === "string" ? userId : userId[0], requestingUserId);
        res.status(202).json({ message: "User deleted succesfully." });
    } catch (error: any) {
        if (error instanceof CannotDeleteOwnAccountError) {
            res.status(409).json({ message: error.message });
        } else if (error instanceof UserDoesNotExistError) {
            res.status(404).json({ message: "user requested does not exist." });
        } else {
            res.status(500).json({ message: "Unable to delete user at this time.", error: error.message });
        }
    }
}

async function createUser(req: Request, res: Response) {
    try {
        const user = await createManagedUser(req.body);
        res.status(201).json({ message: 'User created successfully.', user: userProfile(user) });
    } catch (error: any) {
        if (error instanceof UserAlreadyExistsError) {
            res.status(409).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Unable to create user at this time.', error: error.message });
        }
    }
}

export default { getAllUsers, getUserById, updateUser, deleteUser, createUser };