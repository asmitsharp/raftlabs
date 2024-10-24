/**
 * @file src/app.ts
 * @description Main application file for setting up the Express server and Apollo GraphQL.
 */

import express from "express" // Import the Express framework for building web applications
import http from "http" // Import the HTTP module for creating an HTTP server
import dotenv from "dotenv" // Import dotenv for managing environment variables
import pool from "./utils/db" // Import the database connection pool
import authRoutes from "./routes/auth" // Import authentication-related routes
import itemRoutes from "./routes/item" // Import item-related routes
import { ApolloServer } from "@apollo/server" // Import Apollo Server for GraphQL API
import { expressMiddleware } from "@apollo/server/express4" // Middleware for integrating Apollo with Express
import { typeDefs } from "./schema" // Import GraphQL type definitions
import { resolvers } from "./resolvers" // Import GraphQL resolvers
import bodyParser from "body-parser" // Import body-parser for parsing request bodies
import logger from "./utils/logger" // Import logger for logging application events

dotenv.config() // Load environment variables from .env file

const app = express() // Create an instance of the Express application
const httpServer = http.createServer(app) // Create an HTTP server using the Express app
const port = process.env.PORT || 3000 // Set the port from environment variable or default to 3000

/**
 * Function to check the database connection on application startup.
 * Logs the status of the connection.
 */
const checkDatabaseConnection = async () => {
  try {
    await pool.query("SELECT NOW()") // Execute a simple query to verify the connection
    logger.info("Database connected successfully.") // Log successful connection
  } catch (error) {
    logger.error("Database connection error: " + error) // Log any connection errors
  }
}

checkDatabaseConnection() // Invoke the function to check the database connection

// Middleware to parse JSON request bodies
app.use(express.json())

// Define application routes
app.use("/auth", authRoutes) // Authentication routes
app.use("/items", itemRoutes) // Item-related routes

/**
 * Error handling middleware for catching and logging errors.
 * Responds with a 500 status code and a generic error message.
 */
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(err.stack) // Log the error stack trace
    res.status(500).send("Something went wrong!") // Respond with a generic error message
  }
)

/**
 * Function to start the Apollo Server and set up GraphQL endpoint.
 * Logs the server status and endpoint information.
 */
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs, // GraphQL type definitions
    resolvers, // GraphQL resolvers
  })

  await server.start() // Start the Apollo server

  // Middleware for handling GraphQL requests
  app.use(
    "/graphql",
    bodyParser.json(), // Parse JSON request bodies
    expressMiddleware(server, {
      context: async ({ req }) => ({ req, pool }), // Pass request and database pool to context
    })
  )

  // Start the HTTP server and log the status
  httpServer.listen(port, () => {
    logger.info(`Server is running on port ${port}`) // Log server start
    logger.info(
      `GraphQL endpoint is available at http://localhost:${port}/graphql` // Log GraphQL endpoint
    )
  })
}

// Start the Apollo server and handle any errors
startApolloServer().catch((error) => {
  logger.error("Failed to start server: " + error.message) // Log server start error
})

export default app // Export the Express app for use in other modules
