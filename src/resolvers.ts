import { ItemModel } from "./models/item" // Import ItemModel for database operations

// Define resolvers for handling GraphQL queries and mutations
export const resolvers = {
  Query: {
    getItem: async (_: any, { id }: { id: string }) => {
      // Resolver for retrieving a single item by ID
      return ItemModel.findById(parseInt(id)) // Call the findById method from ItemModel
    },
    getItems: async (
      _: any,
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
    ) => {
      // Resolver for retrieving a list of items with pagination and sorting
      return ItemModel.findAll(page, limit, sortBy, sortOrder as "ASC" | "DESC") // Call the findAll method from ItemModel
    },
    searchItems: async (_: any, { query }: { query: string }) => {
      // Resolver for searching items by name or description
      return ItemModel.search(query) // Call the search method from ItemModel
    },
  },
  Mutation: {
    createItem: async (
      _: any,
      {
        name,
        description,
        price,
      }: { name: string; description: string; price: number }
    ) => {
      // Resolver for creating a new item
      return ItemModel.create(name, description, price) // Call the create method from ItemModel
    },
    updateItem: async (
      _: any,
      {
        id,
        name,
        description,
        price,
      }: { id: string; name: string; description: string; price: number }
    ) => {
      // Resolver for updating an existing item
      return ItemModel.update(parseInt(id), name, description, price) // Call the update method from ItemModel
    },
    deleteItem: async (_: any, { id }: { id: string }) => {
      // Resolver for deleting an item by ID
      return ItemModel.delete(parseInt(id)) // Call the delete method from ItemModel
    },
  },
}
