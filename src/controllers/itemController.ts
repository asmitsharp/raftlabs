/**
 * @file src/controllers/itemController.ts
 * @description Controller for handling item-related operations such as creation, retrieval, updating, and deletion.
 */

import { Request, Response } from "express" // Import Request and Response types from Express
import { ItemModel } from "../models/item" // Import ItemModel for item-related database operations
import { AuthRequest } from "../middleware/auth" // Import AuthRequest for authenticated requests
import logger from "../utils/logger" // Import logger for logging application events

/**
 * Handles the creation of a new item.
 * @param req - The request object containing item details.
 * @param res - The response object for sending back the result.
 */
export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price } = req.body // Destructure item details from request body
    const item = await ItemModel.create(name, description, price) // Create a new item in the database
    res.status(201).json(item) // Respond with the created item
  } catch (error) {
    logger.error("Failed to create Item: " + error) // Log creation error
    res.status(400).json({ error: "Failed to create item" }) // Respond with an error message
  }
}

/**
 * Retrieves an item by its ID.
 * @param req - The request object containing the item ID.
 * @param res - The response object for sending back the result.
 */
export const getItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await ItemModel.findById(parseInt(req.params.id)) // Find item by ID
    if (!item) {
      res.status(404).json({ error: "Item not found" }) // Respond with not found status
      return
    }
    res.json(item) // Respond with the found item
  } catch (error) {
    logger.error("Failed to get Item: " + error) // Log retrieval error
    res.status(400).json({ error: "Failed to get item" }) // Respond with an error message
  }
}

/**
 * Updates an existing item.
 * @param req - The request object containing item details and ID.
 * @param res - The response object for sending back the result.
 */
export const updateItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, price } = req.body // Destructure item details from request body
    const item = await ItemModel.update(
      parseInt(req.params.id), // Get item ID from request parameters
      name,
      description,
      price
    ) // Update item in the database
    if (!item) {
      res.status(404).json({ error: "Item not found" }) // Respond with not found status
      return
    }
    res.json(item) // Respond with the updated item
  } catch (error) {
    logger.error("Failed to update Item: " + error) // Log update error
    res.status(400).json({ error: "Failed to update item" }) // Respond with an error message
  }
}

/**
 * Deletes an item by its ID.
 * @param req - The request object containing the item ID.
 * @param res - The response object for sending back the result.
 */
export const deleteItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const success = await ItemModel.delete(parseInt(req.params.id)) // Delete item from the database
    if (!success) {
      res.status(404).json({ error: "Item not found" }) // Respond with not found status
      return
    }
    res.status(204).send() // Respond with no content status
  } catch (error) {
    logger.error("Failed to delete Item: " + error) // Log deletion error
    res.status(400).json({ error: "Failed to delete item" }) // Respond with an error message
  }
}

/**
 * Retrieves a list of items with pagination and sorting.
 * @param req - The request object containing pagination and sorting parameters.
 * @param res - The response object for sending back the result.
 */
export const getItems = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1 // Get page number from query or default to 1
    const limit = parseInt(req.query.limit as string) || 10 // Get limit from query or default to 10
    const sortBy = (req.query.sortBy as string) || "id" // Get sortBy from query or default to "id"
    const sortOrder = (req.query.sortOrder as "ASC" | "DESC") || "ASC" // Get sortOrder from query or default to "ASC"
    const items = await ItemModel.findAll(page, limit, sortBy, sortOrder) // Retrieve items from the database
    res.json(items) // Respond with the list of items
  } catch (error) {
    logger.error("Failed to get Items: " + error) // Log retrieval error
    res.status(400).json({ error: "Failed to get Items" }) // Respond with an error message
  }
}

/**
 * Searches for items based on a query string.
 * @param req - The request object containing the search query.
 * @param res - The response object for sending back the result.
 */
export const searchItems = async (req: Request, res: Response) => {
  logger.info("Controle Reached searchItems")
  try {
    const query = req.query.q as string // Get search query from request
    logger.info("Search query received: " + query)
    const items = await ItemModel.search(query) // Search for items in the database
    res.json(items) // Respond with the list of matching items
  } catch (error) {
    logger.error("Failed to search Items: " + error) // Log search error
    res.status(400).json({ error: "Failed to search items" }) // Respond with an error message
  }
}
