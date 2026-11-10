import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../models/User';

export interface IUserModel extends IUser, Document { };

// Define a Mongoose schema for the User model that matches the IUser interface
// This schema will be used to create a MongoDB collection for users, ensuring that the data stored in the database adheres to the structure defined in the IUser interface.
const UserSchema: Schema = new Schema(
    {
        type: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        password: { type: String, required: true }
    },
    {
        versionKey: false // Disable the "__v" version key
    });

// Create a database collection for us where name is "User" and based off the UserSchema
export default mongoose.model<IUserModel>('User', UserSchema);