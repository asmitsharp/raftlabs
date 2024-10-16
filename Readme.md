# Node.js Express Item Management API

## Overview
This project is a web API built using Node.js and Express, designed to manage items and user authentication. It provides a RESTful API for creating, retrieving, updating, and deleting items, as well as user registration and login functionalities.

## Features
- **User Authentication**:
  - Register new users with a username, email, and password.
  - Login existing users and receive a JSON Web Token (JWT) for secure access.
- **Item Management**:
  - Create new items with details such as name, description, and price.
  - Retrieve items by ID or get a list of all items.
  - Update existing items.
  - Delete items by ID.
  - Search for items based on name or description.
- **Middleware**:
  - Authentication middleware to protect routes that require user authentication.
- **Database Integration**:
  - Utilizes PostgreSQL for data storage and retrieval.
  - Implements caching for improved performance using a binary search tree.

## Project Structure and File Explanations

### 1. `user.ts`
The User Model implementation handling user-related database operations.

**Key Features:**
- User CRUD operations (Create, Read, Update, Delete)
- Password hashing using bcrypt
- User caching using HashTable
- Database integration with PostgreSQL

**Main Methods:**
```typescript
- create(username, email, password): Creates new user
- findByEmail(email): Finds user by email
- validatePassword(user, password): Validates user password
- update(id, username, email): Updates user information
- delete(id): Deletes user account
```

### 2. `item.ts`
The Item Model implementation managing item-related operations.

**Key Features:**
- Item CRUD operations
- Caching using Binary Search Tree
- Pagination and sorting support
- Search functionality

**Main Methods:**
```typescript
- create(name, description, price): Creates new item
- findById(id): Retrieves item by ID
- update(id, name, description, price): Updates item
- delete(id): Deletes item
- findAll(page, limit, sortBy, sortOrder): Lists items with pagination
- search(query): Searches items by name/description
```

### 3. `ItemBST.ts`
Binary Search Tree implementation for item caching.

**Key Features:**
- Efficient item lookup by ID
- Automatic database synchronization
- Periodic cache updates
- Logging of all operations

**Main Methods:**
```typescript
- insert(id, data): Inserts/updates item in BST
- search(id): Searches for item by ID
- delete(id): Removes item from BST
- syncWithDatabase(): Synchronizes with database
```

### 4. `UserHashTable.ts`
Hash Table implementation for user caching.

**Key Features:**
- Efficient user lookup by email
- LRU (Least Recently Used) eviction
- Automatic cleanup
- Operation logging

**Main Methods:**
```typescript
- set(email, data): Adds/updates user in cache
- get(email): Retrieves user by email
- remove(email): Removes user from cache
- evictLeastRecentlyUsed(): Handles cache eviction
```

## Technologies Used
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- Bcrypt for password hashing
- Winston for logging

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- A package manager like npm or yarn

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/asmitsharp/raftlabs.git
   cd raftlabs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   - Create a PostgreSQL database and user.
   - Update the `.env` file with your database connection details:
     ```
     DATABASE_URL=postgres://username:password@localhost:5432/yourdatabase
     JWT_SECRET=your_jwt_secret
     ```

4. **Run database migrations** (if applicable):
   - Ensure your database schema is set up according to your models.

5. **Start the application**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes
- **POST /auth/register**: Register a new user.
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **POST /auth/login**: Log in an existing user.
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### Item Routes
- **POST /items**: Create a new item (requires authentication).
  ```json
  {
    "name": "string",
    "description": "string",
    "price": number
  }
  ```
- **GET /items/:id**: Retrieve an item by ID.
- **PUT /items/:id**: Update an existing item (requires authentication).
- **DELETE /items/:id**: Delete an item by ID (requires authentication).
- **GET /items**: Retrieve a list of all items.
  - Query parameters:
    - page (default: 1)
    - limit (default: 10)
    - sortBy (default: "id")
    - sortOrder (default: "ASC")
- **GET /items/search**: Search for items based on a query string.
  - Query parameters:
    - q: search query

## Caching Mechanisms

### Binary Search Tree (BST) for Items
- Provides O(log n) lookup time for items
- Automatically synchronizes with database every 5 minutes
- Maintains sorted order of items by ID
- Supports efficient insertion, deletion, and search operations

### Hash Table for Users
- Provides O(1) average lookup time for users
- Implements LRU eviction strategy
- Automatically removes least recently used entries when size limit is reached
- Periodic cleanup of expired entries

## Logging
The application uses Winston for logging. Logs are stored in:
- Console (all levels)
- error.log (error level)
- combined.log (all levels)

## Error Handling
- All database operations are wrapped in try-catch blocks
- Errors are logged with detailed information
- Appropriate HTTP status codes are returned

## Security
- Passwords are hashed using bcrypt
- JWT authentication for protected routes


## Performance Considerations
- Caching mechanisms reduce database load
- Pagination for large datasets
- Efficient data structures for lookups
- Database query optimization


## Acknowledgments
- Thanks to the open-source community for the libraries and tools that made this project possible.
