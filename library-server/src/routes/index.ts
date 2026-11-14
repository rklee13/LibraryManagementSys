import { Express, Request, Response } from 'express';
import authRoutes from './AuthRoutes';
import userRoutes from './UserRoutes';
import bookRoutes from './BookRoutes'
import cardRoutes from './LibraryCardRoutes';
import loanRoutes from './LoanRecordRoutes';

export function registerRoutes(app: Express): void {

    // Define a simple health check endpoint - make sure the server is running
    app.get("/health", (req: Request, res: Response) => {
        res.status(200).json({ message: 'Library Server is running!' });
    });

    // Take in app (express application instance) and register the auth routes under the '/auth' path. This means that any requests to endpoints starting with '/auth' will be handled by the authRoutes router.
    app.use("/auth", authRoutes);
    app.use("/users", userRoutes);
    app.use("/book", bookRoutes);
    app.use("/books", bookRoutes);
    app.use("/card", cardRoutes);
    app.use("/loan", loanRoutes);
}