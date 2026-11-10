import bcrypt from 'bcrypt';
import { config } from '../config';
import UserDao, { IUserModel } from '../daos/UserDao';
import { IUser } from '../models/User';
import { UnableToSaveUserError, InvalidUserAndPasswordError, UserDoesNotExistError } from '../utils/LibraryErrors';

// Register a new user in the database. It will encrypt the user's password before saving it to ensure security. 
// The function takes a user object that adheres to the IUser interface and returns a promise that resolves to the saved user model.
export async function register(user: IUser): Promise<IUserModel> {
    const ROUNDS = config.server.rounds;

    try {
        const hashedPassword = await bcrypt.hash(user.password, ROUNDS);

        // Destructure the user object and replace the password with the hashed password
        const saved = new UserDao({ ...user, password: hashedPassword });

        // Save the user to the database and return the saved user
        return await saved.save();
    } catch (error: any) {
        throw new UnableToSaveUserError(error.message || 'Unable to save user');
    }
}

//
export async function login(credentials: { email: string, password: string }): Promise<IUserModel> {
    const { email, password } = credentials;

    try {
        // Find the user by email in the database
        const user = await UserDao.findOne({ email });

        if (!user) {
            throw new InvalidUserAndPasswordError('User not found. Invalid email.');
        } else {
            // Compare the provided password with the hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) throw new InvalidUserAndPasswordError('Invalid password.');
        }

        // Return the user if the password matches
        return user;
    } catch (error: any) {
        // If the error is a InvalidUserAndPasswordError, rethrow it to be handled by the caller
        throw error;
    }
}

// Returns all users on the database
export async function findAllUsers(): Promise<IUserModel[]> {
    try {
        // Find all users on the database
        const users = await UserDao.find();
        return users;
    } catch (error) {
        return [];
    }
}

// Returns a single user on the database based on the passed id
export async function findUserById(userId: string): Promise<IUserModel> {
    try {
        // Find specific user on the database
        const user = await UserDao.findById(userId);
        if (user) return user;

        throw new UserDoesNotExistError("User does not exist with this ID.");
    } catch (error: any) {
        throw error;
    }
}

// Saves the modified user info to the database and returns the updated user model
export async function modifyUser(user: IUserModel): Promise<IUserModel> {
    try {
        // Using the id, we pass in the modified user object to the database. The new: true will
        // return the new user object (with fresh/updated data)
        let id = await UserDao.findByIdAndUpdate(user._id, user, { returnDocument: 'after' });

        if (!id) throw new UserDoesNotExistError("User does not exist with this ID.");

        return user;
    } catch (error: any) {
        throw error;
    }
}

// Delete the user on the database based on passed user Id
export async function removeUser(userId: string): Promise<string> {
    try {
        // Using the id, we delete the user on the database
        let deleted = await UserDao.findByIdAndDelete(userId);
        if (!deleted) throw new UserDoesNotExistError("User does not exist with this ID.");
        return "User deleted successfully.";
    } catch (error: any) {
        throw error;
    }
}