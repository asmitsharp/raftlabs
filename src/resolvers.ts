/**
 * @file src/resolver.ts
 * @description GraphQL resolvers for handling queries and mutations related to items.
 * This file defines the resolvers that interact with the ItemModel to perform
 * database operations for retrieving, creating, updating, and deleting items.
 */

import { ItemModel } from "./models/item" // Import ItemModel for database operations

// Define resolvers for handling GraphQL queries and mutations
export const resolvers = {
  Query: {
    /**
     * Resolver for retrieving a single item by ID.
     * @param _ - Parent object (not used).
     * @param { id: string } - The ID of the item to retrieve.
     * @returns The item object if found, or null if not found.
     */
    getItem: async (_: any, { id }: { id: string }) => {
      return ItemModel.findById(parseInt(id)) // Call the findById method from ItemModel
    },

    /**
     * Resolver for retrieving a list of items with pagination and sorting.
     * @param _ - Parent object (not used).
     * @param { page?: number; limit?: number; sortBy?: string; sortOrder?: string } -
     * Optional parameters for pagination and sorting.
     * @returns An array of item objects.
     */
    getItems: async (
      _: any,
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
    ) => {
      return ItemModel.findAll(page, limit, sortBy, sortOrder as "ASC" | "DESC") // Call the findAll method from ItemModel
    },

    /**
     * Resolver for searching items by name or description.
     * @param _ - Parent object (not used).
     * @param { query: string } - The search query string.
     * @returns An array of item objects that match the search criteria.
     */
    searchItems: async (_: any, { query }: { query: string }) => {
      return ItemModel.search(query) // Call the search method from ItemModel
    },
  },
  Mutation: {
    /**
     * Resolver for creating a new item.
     * @param _ - Parent object (not used).
     * @param { name: string; description: string; price: number } - The details of the item to create.
     * @returns The created item object.
     */
    createItem: async (
      _: any,
      {
        name,
        description,
        price,
      }: { name: string; description: string; price: number }
    ) => {
      return ItemModel.create(name, description, price) // Call the create method from ItemModel
    },

    /**
     * Resolver for updating an existing item.
     * @param _ - Parent object (not used).
     * @param { id: string; name: string; description: string; price: number } -
     * The ID of the item to update and the new details.
     * @returns The updated item object if successful, or null if not found.
     */
    updateItem: async (
      _: any,
      {
        id,
        name,
        description,
        price,
      }: { id: string; name: string; description: string; price: number }
    ) => {
      return ItemModel.update(parseInt(id), name, description, price) // Call the update method from ItemModel
    },

    /**
     * Resolver for deleting an item by ID.
     * @param _ - Parent object (not used).
     * @param { id: string } - The ID of the item to delete.
     * @returns True if the item was deleted, false otherwise.
     */
    deleteItem: async (_: any, { id }: { id: string }) => {
      return ItemModel.delete(parseInt(id)) // Call the delete method from ItemModel
    },
  },
}
