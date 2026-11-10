import express from 'express';
import AuthController from '../controllers/AuthController';
import { Schemas, ValidateSchema } from '../middlewares/Validation';

const router = express.Router();

// We are telling our express application that when a POST request is made to the '/register' endpoint, it should invoke the handleRegister method from the AuthController. This method will handle the logic for registering a new user.
// We validate against the user creation schema defined in the Validation middleware. If the request body does not match the schema, a 422 Unprocessable Entity response will be sent back to the client, indicating that the input data is invalid. If the validation passes, the request will proceed to the handleRegister method for further processing.
router.post("/register", ValidateSchema(Schemas.user.create, 'body'), AuthController.handleRegister);

// Similar to the registration endpoint, this line sets up a POST endpoint for user login. When a POST request is made to '/login', the handleLogin method from the AuthController will be invoked. This method will handle the logic for authenticating a user based on the provided credentials (email and password).
router.post("/login", ValidateSchema(Schemas.user.login, 'body'), AuthController.handleLogin);

export default router;