/**
 * @file src/utils/ItemBST.ts
 * @description Binary Search Tree implementation for caching items.
 */

import { Pool } from "pg" // Import Pool for managing PostgreSQL connections
import logger from "./logger" // Import the logger

// Class representing a node in the binary search tree
class TreeNode {
  constructor(
    public id: number, // Unique identifier for the item
    public data: any, // Data associated with the item
    public left: TreeNode | null = null, // Left child node
    public right: TreeNode | null = null // Right child node
  ) {}
}

/**
 * Class representing a Binary Search Tree for item caching.
 */
export class ItemBST {
  private root: TreeNode | null = null // Root of the binary search tree
  private pool: Pool // Database connection pool

  /**
   * Constructor for ItemBST.
   * @param pool - The database connection pool.
   */
  constructor(pool: Pool) {
    this.pool = pool
    this.startPeriodicSync() // Start periodic synchronization with the database
  }

  /**
   * Inserts or updates an item in the binary search tree.
   * @param id - The ID of the item.
   * @param data - The data associated with the item.
   */
  insert(id: number, data: any): void {
    const newNode = new TreeNode(id, data) // Create a new TreeNode

    if (!this.root) {
      this.root = newNode // Set as root if tree is empty
      logger.info(`Inserted root node: ${id}`) // Log insertion
      return
    }

    let current = this.root
    while (true) {
      if (id < current.id) {
        if (!current.left) {
          current.left = newNode // Insert to the left
          logger.info(`Inserted node: ${id} to the left of ${current.id}`) // Log insertion
          break
        }
        current = current.left // Move left
      } else if (id > current.id) {
        if (!current.right) {
          current.right = newNode // Insert to the right
          logger.info(`Inserted node: ${id} to the right of ${current.id}`) // Log insertion
          break
        }
        current = current.right // Move right
      } else {
        // Update existing node if id already exists
        current.data = data
        logger.info(`Updated node: ${id}`) // Log update
        break
      }
    }
  }

  /**
   * Searches for an item by ID in the binary search tree.
   * @param id - The ID of the item to search for.
   * @returns The data associated with the item or null if not found.
   */
  search(id: number): any | null {
    let current = this.root
    while (current) {
      if (id === current.id) {
        logger.info(`Found node: ${id}`) // Log successful search
        return current.data // Return data if found
      } else if (id < current.id) {
        current = current.left // Move left
      } else {
        current = current.right // Move right
      }
    }
    logger.warn(`Node not found: ${id}`) // Log warning if not found
    return null // Return null if not found
  }

  /**
   * Deletes an item by ID from the binary search tree.
   * @param id - The ID of the item to delete.
   * @returns True if the item was deleted, false otherwise.
   */
  delete(id: number): boolean {
    const removeNode = (node: TreeNode | null, id: number): TreeNode | null => {
      if (node === null) {
        return null // Node not found
      }

      if (id < node.id) {
        node.left = removeNode(node.left, id) // Move left
        return node
      } else if (id > node.id) {
        node.right = removeNode(node.right, id) // Move right
        return node
      } else {
        // Node to delete found
        if (node.left === null && node.right === null) {
          logger.info(`Deleted leaf node: ${id}`) // Log deletion of leaf node
          return null // Node is a leaf
        } else if (node.left === null) {
          logger.info(`Deleted node: ${id}, replaced by right child`) // Log deletion
          return node.right // Node has only right child
        } else if (node.right === null) {
          logger.info(`Deleted node: ${id}, replaced by left child`) // Log deletion
          return node.left // Node has only left child
        } else {
          // Node has two children
          let minRight = node.right
          while (minRight.left !== null) {
            minRight = minRight.left // Find the minimum node in the right subtree
          }
          node.id = minRight.id // Replace with the minimum node
          node.data = minRight.data
          node.right = removeNode(node.right, minRight.id) // Remove the minimum node
          logger.info(`Deleted node: ${id}, replaced with node: ${minRight.id}`) // Log deletion
          return node
        }
      }
    }

    const initialSize = this.size() // Get initial size
    this.root = removeNode(this.root, id) // Remove the node
    const deleted = this.size() < initialSize // Check if deletion was successful
    logger.info(
      deleted
        ? `Successfully deleted node: ${id}`
        : `Failed to delete node: ${id}`
    ) // Log result
    return deleted // Return true if deleted
  }

  /**
   * Returns the number of nodes in the binary search tree.
   * @returns The total count of nodes.
   */
  size(): number {
    let count = 0
    this.inOrderTraversal(() => count++) // Count nodes using in-order traversal
    return count // Return the total count
  }

  /**
   * Performs in-order traversal of the binary search tree.
   * @param callback - The callback function to execute for each node.
   */
  inOrderTraversal(callback: (id: number, data: any) => void): void {
    const traverse = (node: TreeNode | null) => {
      if (node) {
        traverse(node.left) // Traverse left
        callback(node.id, node.data) // Call the callback with node data
        traverse(node.right) // Traverse right
      }
    }
    traverse(this.root) // Start traversal from the root
  }

  /**
   * Synchronizes the binary search tree with the database.
   */
  private async syncWithDatabase(): Promise<void> {
    try {
      const result = await this.pool.query("SELECT * FROM items") // Query to get items from the database
      const dbItems = result.rows

      // Clear the current tree
      this.root = null

      // Rebuild the tree with data from the database
      for (const item of dbItems) {
        this.insert(item.id, item) // Insert each item into the BST
      }

      logger.info("BST synchronized with database") // Log successful synchronization
    } catch (error) {
      logger.error("Error syncing BST with database: " + error) // Log error
    }
  }

  /**
   * Starts periodic synchronization with the database.
   */
  private startPeriodicSync(): void {
    // Sync every 5 minutes
    setInterval(() => this.syncWithDatabase(), 5 * 60 * 1000)
    logger.info("Started periodic synchronization with the database") // Log start of periodic sync
  }
}
