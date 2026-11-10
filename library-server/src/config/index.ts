import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME: string = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD: string = process.env.MONGO_PASSWORD || '';
const MONGO_HOST: string = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT: string = process.env.MONGO_PORT || '27017';
const MONGO_DB_NAME: string = process.env.MONGO_DB_NAME || 'librarydb';
const MONGO_URL: string = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}?retryWrites=true&w=majority`;

const PORT: number = Number(process.env.SERVER_PORT) || 8000;
const ROUNDS: number = Number(process.env.SERVER_ROUNDS) || Math.floor(Math.random() * 11); // Randomly generate a number between 0 and 10 if not provided

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: PORT,
        rounds: ROUNDS
    }
};