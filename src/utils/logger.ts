/**
 * @file src/utils/logger.ts
 * @description Logger setup using Winston for logging application events.
 */

import { createLogger, format, transports } from "winston" // Import winston for logging

// Create a logger instance with specified settings
const logger = createLogger({
  level: "info", // Set the default logging level
  format: format.combine(
    format.timestamp(), // Include timestamp in log messages
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}` // Define the log message format
    })
  ),
  transports: [
    new transports.Console(), // Log messages to the console
    new transports.File({ filename: "error.log", level: "error" }), // Log error messages to a file
    new transports.File({ filename: "combined.log" }), // Log all messages to a combined log file
  ],
})

export default logger // Export the logger for use in other modules
