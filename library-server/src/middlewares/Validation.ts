import Joi, { ObjectSchema } from 'joi';

import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
import { IUserModel } from '../daos/UserDao';
import { create } from 'node:domain';
import { IBook } from '../models/Book';
import { title } from 'node:process';
import { IBookModel } from '../daos/BookDao';
import { ILibraryCard } from '../models/LibraryCard';
import { ILoanRecord } from '../models/LoanRecord';
import { ILoanRecordModel } from '../daos/LoanRecordDao';

export function ValidateSchema(schema: ObjectSchema, property: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate the request against the provided schema
            switch (property) {
                case 'query':
                    await schema.validateAsync(req.query);
                    break;
                case 'params':
                    await schema.validateAsync(req.params);
                    break;
                default:
                    await schema.validateAsync(req.body);
            }
            next(); // If it's valid, proceed to the next middleware or route handler
        } catch (error: any) {
            res.status(422).json({ message: "Object validation failed. Please check your input." });
        }
    };
}

export const Schemas = {
    // Define a schema for user creation that matches the IUser interface
    user: {
        create: Joi.object<IUser>({
            type: Joi.string().valid('ADMIN', 'EMPLOYEE', 'PATRON').required(),
            email: Joi.string().email().required(),
            firstName: Joi.string().min(2).max(100).required(),
            lastName: Joi.string().min(2).max(100).required(),
            password: Joi.string().min(8).max(100).required()
        }),
        login: Joi.object<{ email: string, password: string }>({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(100).required()
        }),
        userId: Joi.object<{ userId: string }>({
            userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
        }),
        update: Joi.object<IUserModel>({
            _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            type: Joi.string().valid('ADMIN', 'EMPLOYEE', 'PATRON').required(),
            email: Joi.string().email().required(),
            firstName: Joi.string().min(2).max(100).required(),
            lastName: Joi.string().min(2).max(100).required(),
            password: Joi.string().min(8).max(100)
        })
    },
    book: {
        create: Joi.object<IBook>({
            barcode: Joi.string().regex(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/).required(),
            cover: Joi.string().required(),
            title: Joi.string().required(),
            authors: Joi.array().required(),
            description: Joi.string().required(),
            subjects: Joi.array().required(),
            publicationDate: Joi.date().required(),
            publisher: Joi.string().required(),
            pages: Joi.number().required(),
            genre: Joi.string().required()
        }),
        update: Joi.object<IBookModel>({
            _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
            barcode: Joi.string().regex(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/).required(),
            cover: Joi.string().required(),
            title: Joi.string().required(),
            authors: Joi.array().required(),
            description: Joi.string().required(),
            subjects: Joi.array().required(),
            publicationDate: Joi.date().required(),
            publisher: Joi.string().required(),
            pages: Joi.number().required(),
            genre: Joi.string().required()
        }),
        delete: Joi.object<{ barcode: string }>({
            barcode: Joi.string().regex(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/).required()
        })
    },
    libraryCard: {
        create: Joi.object<ILibraryCard>({
            user: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
        }),
        get: Joi.object<{ cardId: string }>({
            cardId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
        })
    },
    loan: {
        create: Joi.object<ILoanRecord>({
            status: Joi.string().valid('AVAILABLE', 'LOANED').required(),
            loanedDate: Joi.date().required(),
            dueDate: Joi.date().required(),
            returnedDate: Joi.date(),
            patron: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            employeeOut: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            employeeIn: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
            item: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
        update: Joi.object<ILoanRecordModel>({
            _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            status: Joi.string().valid('AVAILABLE', 'LOANED').required(),
            loanedDate: Joi.date().required(),
            dueDate: Joi.date().required(),
            returnedDate: Joi.date(),
            patron: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            employeeOut: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            employeeIn: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
            item: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
        query: Joi.object<{ property: string, value: string | Date }>({
            property: Joi.string().valid('_id', 'status', 'loanedDate', 'dueDate', 'returnedDate', 'patron', 'employeeOut', 'employeeIn', 'item').required(),
            value: Joi.alternatives().try(Joi.string(), Joi.date()).required()
        })
    }
}