import { Request, Response } from 'express';
import { login, register } from '../services/UserService';
import { IUser } from '../models/User';
import { IUserModel } from '../daos/UserDao';
import { InvalidUserAndPasswordError } from '../utils/LibraryErrors';
import { createAuthToken } from '../utils/AuthToken';

async function handleRegister(req: Request, res: Response): Promise<void> {
    const user: IUser = req.body; // JSON body of the request should match the IUser interface

    try {
        const registeredUser = await register(user);
        res.status(201).json({
            message: 'User registered successfully.',
            user: {
                _id: registeredUser._id,
                type: registeredUser.type,
                email: registeredUser.email,
                firstName: registeredUser.firstName,
                lastName: registeredUser.lastName
            }
        }); // Return the newly created user with a 201 status code
    } catch (error: any) {
        if (error.message.includes("E11000 duplicate key error collection:")) {
            res.status(409).json({
                message: "A user with that email already exists.",
                error: error.message
            });
        } else {
            res.status(500).json(
                {
                    message: "Failed to register user",
                    error: error.message
                }); // Return a 500 status code with the error message
        }
    }
}

async function handleLogin(req: Request, res: Response): Promise<void> {
    const credentials = req.body;

    try {
        const user: IUserModel = await login(credentials);

        if (!user) {
            res.status(401).json({
                message: 'Invalid email or password.'
            });
            return;
        }

        res.status(200).json({
            message: 'Login successful.',
            token: createAuthToken(user._id.toString()),
            user: {
                _id: user._id,
                type: user.type,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error: any) {
        if (error instanceof InvalidUserAndPasswordError) {
            res.status(401).json({
                message: "Unable to login user at this time. Please check your credentials and try again.",
                error: error.message,
            });
        } else {
            res.status(500).json({
                message: 'Failed to login user',
                error: error.message
            });
        }
    }
}

export default { handleRegister, handleLogin };