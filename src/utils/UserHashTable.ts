/**
 * @file src/utils/UserHashTable.ts
 * @description Hash Table implementation for caching user data.
 */

import logger from "./logger" // Import the logger

// Class representing a node in the hash table
class UserNode {
  constructor(
    public email: string, // Email of the user
    public data: any, // Data associated with the user
    public lastAccessed: number = Date.now() // Timestamp of the last access
  ) {}
}

/**
 * Class representing a Hash Table for user caching.
 */
export class UserHashTable {
  private table: Array<UserNode[]> // Array of buckets for the hash table
  private size: number // Size of the hash table
  private maxSize: number // Maximum size before eviction
  private evictionInterval: NodeJS.Timeout // Interval for periodic eviction

  /**
   * Constructor for UserHashTable.
   * @param size - The size of the hash table.
   * @param maxSize - The maximum size before eviction.
   */
  constructor(size: number = 997, maxSize: number = 10000) {
    this.table = new Array(size).fill(null).map(() => []) // Initialize the hash table
    this.size = size
    this.maxSize = maxSize
    this.evictionInterval = setInterval(
      () => this.evictLeastRecentlyUsed(),
      60000
    ) // Run eviction every minute
  }

  /**
   * Hash function to compute index based on email.
   * @param email - The email to hash.
   * @returns The computed index.
   */
  private hash(email: string): number {
    let total = 0
    for (let i = 0; i < email.length; i++) {
      total += email.charCodeAt(i)
    }
    return total % this.size // Return index
  }

  /**
   * Adds or updates a user in the hash table.
   * @param email - The email of the user.
   * @param data - The data associated with the user.
   */
  set(email: string, data: any): void {
    const index = this.hash(email) // Get the index for the email
    const node = new UserNode(email, data) // Create a new UserNode
    const bucket = this.table[index] // Get the corresponding bucket

    // Check if the email already exists in the bucket
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].email === email) {
        bucket[i] = node // Update existing node
        logger.info(`Updated user: ${email}`) // Log update
        return
      }
    }

    bucket.push(node) // Add new node to the bucket
    logger.info(`Added user: ${email}`) // Log addition

    // Check if we need to evict
    if (this.getCurrentSize() > this.maxSize) {
      this.evictLeastRecentlyUsed()
    }
  }

  /**
   * Retrieves user data from the hash table.
   * @param email - The email of the user to retrieve.
   * @returns The user data or undefined if not found.
   */
  get(email: string): any | undefined {
    const index = this.hash(email) // Get the index for the email
    const bucket = this.table[index] // Get the corresponding bucket

    // Search for the user in the bucket
    for (const node of bucket) {
      if (node.email === email) {
        node.lastAccessed = Date.now() // Update last accessed time
        logger.info(`Accessed user: ${email}`) // Log access
        return node.data // Return user data
      }
    }

    logger.warn(`User not found: ${email}`) // Log warning if not found
    return undefined // Return undefined if not found
  }

  /**
   * Removes a user from the hash table.
   * @param email - The email of the user to remove.
   * @returns True if the user was removed, false otherwise.
   */
  remove(email: string): boolean {
    const index = this.hash(email) // Get the index for the email
    const bucket = this.table[index] // Get the corresponding bucket

    // Search for the user in the bucket
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].email === email) {
        bucket.splice(i, 1) // Remove user from the bucket
        logger.info(`Removed user: ${email}`) // Log removal
        return true // Return true if removed
      }
    }

    logger.warn(`Failed to remove user: ${email} - not found`) // Log warning if not found
    return false // Return false if not found
  }

  /**
   * Returns the current size of the hash table.
   * @returns The current size.
   */
  private getCurrentSize(): number {
    // Get the current size of the hash table
    return this.table.reduce((total, bucket) => total + bucket.length, 0)
  }

  /**
   * Evicts the least recently used user from the hash table.
   */
  private evictLeastRecentlyUsed(): void {
    // Evict the least recently used user from the hash table
    let oldest: UserNode | null = null
    let oldestIndex: number = -1
    let oldestBucketIndex: number = -1

    for (let i = 0; i < this.table.length; i++) {
      const bucket = this.table[i]
      for (let j = 0; j < bucket.length; j++) {
        if (!oldest || bucket[j].lastAccessed < oldest.lastAccessed) {
          oldest = bucket[j]
          oldestIndex = j
          oldestBucketIndex = i
        }
      }
    }

    if (oldestBucketIndex !== -1 && oldestIndex !== -1) {
      this.table[oldestBucketIndex].splice(oldestIndex, 1) // Remove the oldest user
      logger.info(`Evicted user: ${oldest!.email}`) // Log eviction
    }
  }

  /**
   * Cleans up the eviction interval.
   */
  cleanup(): void {
    // Clear the eviction interval
    clearInterval(this.evictionInterval)
    logger.info("Cleanup called, eviction interval cleared.")
  }
}
