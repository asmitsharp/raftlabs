import pool from "../utils/db" // Import database connection pool
import logger from "../utils/logger" // Import logger for logging
import bcrypt from "bcrypt" // Import bcrypt for password hashing
import { UserHashTable } from "../utils/UserHashTable" // Import UserHashTable for caching users

const userHashTable = new UserHashTable() // Create an instance of UserHashTable for caching users

// Define the User interface
export interface User {
  id: number // Unique identifier for the user
  username: string // Username of the user
  email: string // Email of the user
  password: string // Hashed password of the user
}

export class UserModel {
  // Method to create a new user
  static async create(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10) // Hash the password
      const result = await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, hashedPassword]
      ) // Insert user into the database
      const user = result.rows[0] // Get the created user
      userHashTable.set(email, user) // Cache the user
      return user // Return the created user
    } catch (error) {
      logger.error("Failed to create User: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }

  // Method to find a user by email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const cachedUser = userHashTable.get(email) // Get user from cache
      if (cachedUser) {
        return cachedUser // Return cached user if found
      }

      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]) // Query the database for the user
      const user = result.rows[0] || null // Get the user or null if not found
      if (user) {
        userHashTable.set(email, user) // Cache the user
      }
      return user // Return the user
    } catch (error) {
      logger.error("Failed to find the User by email: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }

  // Method to validate a user's password
  static async validatePassword(
    user: User,
    password: string
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password) // Compare provided password with hashed password
  }

  // Method to update a user's information
  static async update(
    id: number,
    username: string,
    email: string
  ): Promise<User | null> {
    try {
      const result = await pool.query(
        "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *",
        [username, email, id]
      ) // Update user in the database
      const user = result.rows[0] || null // Get the updated user
      if (user) {
        userHashTable.set(email, user) // Cache the updated user
      }
      return user // Return the updated user
    } catch (error) {
      logger.error("Failed to update the User: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }

  // Method to delete a user by ID
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING email",
        [id]
      ) // Delete user from the database
      const deleted = result.rowCount! > 0 // Check if the user was deleted
      if (deleted && result.rows[0]) {
        userHashTable.remove(result.rows[0].email) // Remove user from cache
      }
      return deleted // Return true if deleted
    } catch (error) {
      logger.error("Failed to delete the User: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }
}
