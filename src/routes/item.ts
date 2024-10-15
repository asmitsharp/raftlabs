import express from "express" // Import the Express framework
import {
  createItem, // Import the function to create a new item
  getItem, // Import the function to retrieve an item by ID
  updateItem, // Import the function to update an existing item
  deleteItem, // Import the function to delete an item by ID
  getItems, // Import the function to retrieve a list of items
  searchItems, // Import the function to search for items
} from "../controllers/itemController" // Import item controller functions
import { authenticate } from "../middleware/auth" // Import authentication middleware

const router = express.Router() // Create a new router instance

// Define routes for item-related operations
router.post("/", authenticate, createItem) // Route to create a new item (requires authentication)
router.get("/:id", getItem) // Route to retrieve an item by ID
router.put("/:id", authenticate, updateItem) // Route to update an existing item (requires authentication)
router.delete("/:id", authenticate, deleteItem) // Route to delete an item by ID (requires authentication)
router.get("/", getItems) // Route to retrieve a list of items
router.get("/search", searchItems) // Route to search for items

export default router // Export the router for use in other modules
