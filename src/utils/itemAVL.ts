/**
 * @file src/utils/ItemAVL.ts
 * @description AVL Tree implementation for caching items with automatic balancing
 */

import { Pool } from "pg"
import logger from "./logger"

class TreeNode {
  height: number = 1

  constructor(
    public id: number,
    public data: any,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null
  ) {}
}

export class ItemAVL {
  private root: TreeNode | null = null
  private pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
    this.startPeriodicSync()
  }

  private getHeight(node: TreeNode | null): number {
    return node ? node.height : 0
  }

  private getBalance(node: TreeNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0
  }

  private updateHeight(node: TreeNode): void {
    node.height =
      Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1
  }

  private rightRotate(y: TreeNode): TreeNode {
    const x = y.left as TreeNode
    const T2 = x.right

    x.right = y
    y.left = T2

    this.updateHeight(y)
    this.updateHeight(x)

    return x
  }

  private leftRotate(x: TreeNode): TreeNode {
    const y = x.right as TreeNode
    const T2 = y.left

    y.left = x
    x.right = T2

    this.updateHeight(x)
    this.updateHeight(y)

    return y
  }

  insert(id: number, data: any): void {
    this.root = this.insertNode(this.root, id, data)
    logger.info(`Inserted/Updated node: ${id}`)
  }

  private insertNode(node: TreeNode | null, id: number, data: any): TreeNode {
    // Standard BST insertion
    if (!node) {
      return new TreeNode(id, data)
    }

    if (id < node.id) {
      node.left = this.insertNode(node.left, id, data)
    } else if (id > node.id) {
      node.right = this.insertNode(node.right, id, data)
    } else {
      // Update data if id already exists
      node.data = data
      return node
    }

    // Update height
    this.updateHeight(node)

    // Get balance factor
    const balance = this.getBalance(node)

    // Left Left Case
    if (balance > 1 && id < (node.left as TreeNode).id) {
      return this.rightRotate(node)
    }

    // Right Right Case
    if (balance < -1 && id > (node.right as TreeNode).id) {
      return this.leftRotate(node)
    }

    // Left Right Case
    if (balance > 1 && id > (node.left as TreeNode).id) {
      node.left = this.leftRotate(node.left as TreeNode)
      return this.rightRotate(node)
    }

    // Right Left Case
    if (balance < -1 && id < (node.right as TreeNode).id) {
      node.right = this.rightRotate(node.right as TreeNode)
      return this.leftRotate(node)
    }

    return node
  }

  search(id: number): any | null {
    let current = this.root
    while (current) {
      if (id === current.id) {
        logger.info(`Found node: ${id}`)
        return current.data
      }
      current = id < current.id ? current.left : current.right
    }
    logger.warn(`Node not found: ${id}`)
    return null
  }

  delete(id: number): boolean {
    const initialSize = this.size()
    this.root = this.deleteNode(this.root, id)
    const deleted = this.size() < initialSize
    logger.info(
      deleted
        ? `Successfully deleted node: ${id}`
        : `Failed to delete node: ${id}`
    )
    return deleted
  }

  private deleteNode(node: TreeNode | null, id: number): TreeNode | null {
    if (!node) return null

    if (id < node.id) {
      node.left = this.deleteNode(node.left, id)
    } else if (id > node.id) {
      node.right = this.deleteNode(node.right, id)
    } else {
      // Node with only one child or no child
      if (!node.left) return node.right
      if (!node.right) return node.left

      // Node with two children
      const minNode = this.findMin(node.right)
      node.id = minNode.id
      node.data = minNode.data
      node.right = this.deleteNode(node.right, minNode.id)
    }

    // Update height
    this.updateHeight(node)

    // Balance the tree
    const balance = this.getBalance(node)

    // Left Left Case
    if (balance > 1 && this.getBalance(node.left) >= 0) {
      return this.rightRotate(node)
    }

    // Left Right Case
    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.leftRotate(node.left as TreeNode)
      return this.rightRotate(node)
    }

    // Right Right Case
    if (balance < -1 && this.getBalance(node.right) <= 0) {
      return this.leftRotate(node)
    }

    // Right Left Case
    if (balance < -1 && this.getBalance(node.right) > 0) {
      node.right = this.rightRotate(node.right as TreeNode)
      return this.leftRotate(node)
    }

    return node
  }

  private findMin(node: TreeNode): TreeNode {
    let current = node
    while (current.left) {
      current = current.left
    }
    return current
  }

  size(): number {
    let count = 0
    this.inOrderTraversal(() => count++)
    return count
  }

  inOrderTraversal(callback: (id: number, data: any) => void): void {
    const traverse = (node: TreeNode | null) => {
      if (node) {
        traverse(node.left)
        callback(node.id, node.data)
        traverse(node.right)
      }
    }
    traverse(this.root)
  }

  getTreeHeight(): number {
    return this.getHeight(this.root)
  }

  private async syncWithDatabase(): Promise<void> {
    try {
      const result = await this.pool.query("SELECT * FROM items")
      this.root = null

      // Insert items in a randomized order to maintain better balance
      const items = result.rows
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[items[i], items[j]] = [items[j], items[i]]
      }

      for (const item of items) {
        this.insert(item.id, item)
      }

      logger.info(
        `AVL Tree synchronized with database. Tree height: ${this.getTreeHeight()}`
      )
    } catch (error) {
      logger.error("Error syncing AVL Tree with database: " + error)
    }
  }

  private startPeriodicSync(): void {
    setInterval(() => this.syncWithDatabase(), 5 * 60 * 1000)
    logger.info("Started periodic synchronization with database")
  }
}
