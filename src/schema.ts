/**
 * @file src/schema.ts
 * @description GraphQL schema definitions for User and Item types.
 */

import { gql } from "apollo-server-express"

// Define the GraphQL schema
export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Item {
    id: ID!
    name: String!
    description: String!
    price: Float!
  }

  type Query {
    getItem(id: ID!): Item
    getItems(page: Int, limit: Int, sortBy: String, sortOrder: String): [Item!]!
    searchItems(query: String!): [Item!]!
  }

  type Mutation {
    createItem(name: String!, description: String!, price: Float!): Item!
    updateItem(
      id: ID!
      name: String!
      description: String!
      price: Float!
    ): Item!
    deleteItem(id: ID!): Boolean!
  }
`
