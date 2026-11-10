import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from './config';
import { registerRoutes } from './routes';

const PORT = config.server.port;

// Create an instance of the Express application
const app: Express = express();

// Setup middleware
app.use(express.json());    // Parse JSON request bodies
app.use(cors());            // Enable Cross-Origin Resource Sharing

(async function startUp() {
    try {
        // Here you can add any asynchronous initialization logic if needed 
        await mongoose.connect(config.mongo.url, { w: "majority", retryWrites: true, authMechanism: "DEFAULT" });

        console.log('Connected to MongoDB successfully.');

        registerRoutes(app); // Register all routes for the application

        // Define a simple health check endpoint - make sure the server is running
        app.get("/health", (req: Request, res: Response) => {
            res.status(200).json({ message: 'Library Server is running!' });
        });

        app.listen(PORT, () => {
            console.log(`Library Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log('Error during server startup:', error);
    }
})();
