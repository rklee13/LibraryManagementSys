import bcrypt from 'bcrypt';
import { config } from '../config';
import UserDao, { IUserModel } from '../daos/UserDao';
import { IUser } from '../models/User';
import {
    UnableToSaveUserError,
    InvalidUserAndPasswordError,
    UserDoesNotExistError,
    UserAlreadyExistsError,
    CannotDeleteOwnAccountError
} from '../utils/LibraryErrors';

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
    return UserDao.find({}, '-password');
}

export async function createManagedUser(user: Omit<IUser, 'type'> & { type: 'EMPLOYEE' | 'PATRON' }): Promise<IUserModel> {
    try {
        const hashedPassword = await bcrypt.hash(user.password, config.server.rounds);
        const saved = new UserDao({ ...user, password: hashedPassword });
        return await saved.save();
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            throw new UserAlreadyExistsError('A user with that email already exists.');
        }
        throw new UnableToSaveUserError('Unable to save user.');
    }
}

// Returns a single user on the database based on the passed id
export async function findUserById(userId: string): Promise<IUserModel> {
    try {
        // Find specific user on the database
        const user = await UserDao.findById(userId).select('-password');
        if (user) return user;

        throw new UserDoesNotExistError("User does not exist with this ID.");
    } catch (error: any) {
        throw error;
    }
}

// Saves the modified user info to the database and returns the updated user model
export async function modifyUser(user: IUserModel): Promise<IUserModel> {
    try {
        const existingUser = await UserDao.findById(user._id);
        if (!existingUser) throw new UserDoesNotExistError("User does not exist with this ID.");
        existingUser.email = user.email;
        existingUser.firstName = user.firstName;
        existingUser.lastName = user.lastName;
        return await existingUser.save();
    } catch (error: any) {
        throw error;
    }
}

// Delete the user on the database based on passed user Id
export async function removeUser(userId: string, requestingUserId: string): Promise<string> {
    if (userId === requestingUserId) {
        throw new CannotDeleteOwnAccountError('Administrators cannot delete their own active account.');
    }
    try {
        // Using the id, we delete the user on the database
        let deleted = await UserDao.findByIdAndDelete(userId);
        if (!deleted) throw new UserDoesNotExistError("User does not exist with this ID.");
        return "User deleted successfully.";
    } catch (error: any) {
        throw error;
    }
}