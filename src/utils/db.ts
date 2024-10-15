import { Pool } from "pg" // Import Pool for managing PostgreSQL connections
import dotenv from "dotenv" // Import dotenv for managing environment variables

dotenv.config() // Load environment variables from .env file

// Create a new Pool instance for connecting to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use the database URL from environment variables
})

export default pool // Export the pool for use in other modules
