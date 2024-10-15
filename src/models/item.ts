import pool from "../utils/db" // Import the database connection pool
import { ItemBST } from "../utils/ItemBST" // Import the binary search tree for items
import logger from "../utils/logger" // Import logger for logging

const itemBST = new ItemBST(pool) // Create an instance of ItemBST for caching items

// Define the Item interface
export interface Item {
  id: number // Unique identifier for the item
  name: string // Name of the item
  description: string // Description of the item
  price: number // Price of the item
}

export class ItemModel {
  // Method to create a new item
  static async create(
    name: string,
    description: string,
    price: number
  ): Promise<Item> {
    try {
      const result = await pool.query(
        "INSERT INTO items (name, description, price) VALUES ($1, $2, $3) RETURNING *",
        [name, description, price]
      ) // Insert item into the database
      const item = result.rows[0] // Get the created item
      itemBST.insert(item.id, item) // Insert item into the binary search tree for caching
      return item // Return the created item
    } catch (error) {
      logger.error("Failed to create Item: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }

  // Method to find an item by ID
  static async findById(id: number): Promise<Item | null> {
    try {
      const cachedItem = itemBST.search(id) // Search for item in the binary search tree
      if (cachedItem) {
        return cachedItem // Return cached item if found
      }

      const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]) // Query the database for the item
      const item = result.rows[0] || null // Get the item or null if not found
      if (item) {
        itemBST.insert(item.id, item) // Insert item into the binary search tree for caching
      }
      return item // Return the item
    } catch (error) {
      logger.error("Failed to find Item by ID: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }

  // Method to update an existing item
  static async update(
    id: number,
    name: string,
    description: string,
    price: number
  ): Promise<Item | null> {
    try {
      const result = await pool.query(
        "UPDATE items SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *",
        [name, description, price, id]
      ) // Update item in the database
      const item = result.rows[0] || null // Get the updated item
      if (item) {
        itemBST.insert(item.id, item) // Update the cached item in the binary search tree
      } else {
        itemBST.delete(id) // Remove item from the tree if not found
      }
      return item // Return the updated item
    } catch (error) {
      logger.error("Failed to update the Item: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }

  // Method to delete an item by ID
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await pool.query("DELETE FROM items WHERE id = $1", [id]) // Delete item from the database
      const deleted = result.rowCount! > 0 // Check if the item was deleted
      if (deleted) {
        itemBST.delete(id) // Remove item from the binary search tree
      }
      return deleted // Return true if deleted
    } catch (error) {
      logger.error("Failed to delete the Item: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }

  // Method to find all items with pagination and sorting
  static async findAll(
    page: number = 1,
    limit: number = 10,
    sortBy: string = "id",
    sortOrder: "ASC" | "DESC" = "ASC"
  ): Promise<Item[]> {
    const offset = (page - 1) * limit // Calculate offset for pagination
    const result = await pool.query(
      `SELECT * FROM items ORDER BY ${sortBy} ${sortOrder} LIMIT $1 OFFSET $2`,
      [limit, offset]
    ) // Query the database for items
    return result.rows // Return the list of items
  }

  // Method to search for items by name or description
  static async search(query: string): Promise<Item[]> {
    try {
      const result = await pool.query(
        "SELECT * FROM items WHERE name ILIKE $1 OR description ILIKE $1",
        [`%${query}%`]
      ) // Query the database for items matching the query
      return result.rows // Return the list of matching items
    } catch (error) {
      logger.error("Failed to search the queried Item: " + error) // Log error
      throw error // Rethrow error for handling in the controller
    }
  }
}
