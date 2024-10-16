import { Request, Response } from "express" // Import Request and Response types from Express
import jwt from "jsonwebtoken" // Import jsonwebtoken for creating JWT tokens
import { UserModel } from "../models/user" // Import UserModel for user-related database operations
import logger from "../utils/logger" // Import logger for logging application events

/**
 * Handles user registration.
 * @param req - The request object containing user details.
 * @param res - The response object for sending back the result.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body // Destructure user details from request body
    const user = await UserModel.create(username, email, password) // Create a new user in the database
    const token = jwt.sign(
      { userId: user.id }, // Create a JWT token with user ID
      process.env.JWT_SECRET as string // Use the secret from environment variables
    )
    const { password: _, ...userWithoutPassword } = user // Exclude the password from the user object
    res.status(201).json({ user: userWithoutPassword, token }) // Respond with the created user and token
  } catch (error) {
    logger.error("Registration Failed: " + error) // Log registration error
    res.status(400).json({ error: "Registration failed" }) // Respond with an error message
  }
}

/**
 * Handles user login.
 * @param req - The request object containing user credentials.
 * @param res - The response object for sending back the result.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body // Destructure user credentials from request body
    const user = await UserModel.findByEmail(email) // Find user by email
    // Validate user credentials
    if (!user || !(await UserModel.validatePassword(user, password))) {
      res.status(401).json({ error: "Invalid credentials" }) // Respond with unauthorized status
      return
    }
    const token = jwt.sign(
      { userId: user.id }, // Create a JWT token with user ID
      process.env.JWT_SECRET as string // Use the secret from environment variables
    )
    const { password: _, ...userWithoutPassword } = user // Exclude the password from the user object
    res.status(200).json({ user: userWithoutPassword, token }) // Respond with the created user and token
  } catch (error) {
    logger.error("Login Failed: " + error) // Log login error
    res.status(400).json({ error: "Login failed" }) // Respond with an error message
  }
}
