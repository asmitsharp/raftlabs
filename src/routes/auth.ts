import express from "express" // Import the Express framework
import { register, login } from "../controllers/authController" // Import authentication controller functions

const router = express.Router() // Create a new router instance

// Define routes for authentication operations
router.post("/register", register) // Route to register a new user
router.post("/login", login) // Route to log in an existing user

export default router // Export the router for use in other modules
