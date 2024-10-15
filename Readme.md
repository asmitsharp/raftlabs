## Overview

This project is a web application built using Node.js and Express, designed to manage items and user authentication. It provides a RESTful API for creating, retrieving, updating, and deleting items, as well as user registration and login functionalities.

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

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- Bcrypt for password hashing
- Winston for logging

## Getting Started

To run this project locally, follow these steps:

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- A package manager like npm or yarn

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/yourproject.git
   cd yourproject
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
   npm start
   ```

6. **Access the API**:
   - The application will be running on `http://localhost:3000`.
   - You can use tools like Postman or curl to interact with the API.

## API Endpoints

### Authentication Routes

- **POST /auth/register**: Register a new user.
- **POST /auth/login**: Log in an existing user.

### Item Routes

- **POST /items**: Create a new item (requires authentication).
- **GET /items/:id**: Retrieve an item by ID.
- **PUT /items/:id**: Update an existing item (requires authentication).
- **DELETE /items/:id**: Delete an item by ID (requires authentication).
- **GET /items**: Retrieve a list of all items.
- **GET /items/search**: Search for items based on a query string.

## Logging

The application uses Winston for logging. Logs are stored in the console and can also be saved to files (`error.log` for errors and `combined.log` for all logs).

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the open-source community for the libraries and tools that made this project possible.
