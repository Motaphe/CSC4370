# Review Website with User Authentication

A beautiful review website built with Node.js, Express, MySQL, and Docker. Features user authentication, review management, and a modern Catppuccin-themed UI.


## Quick Start with Docker

1. **Clone and navigate to the project:**
   ```bash
   cd LoggingIntoAWebsite
   ```

2. **Start the application with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Visit the website:**
   Open your browser and go to `http://localhost:3000`

## Manual Setup (without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MySQL database:**
   - Create a database named `review`
   - Run the SQL commands from `init.sql` to create tables and sample data

3. **Update database configuration in `server.js`:**
   ```javascript
   const dbConfig = {
       host: 'localhost',
       user: 'your_username',
       password: 'your_password',
       database: 'review',
       port: 3306
   };
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Default Accounts

The database is initialized with sample accounts:
- **Username:** `admin` | **Password:** `password`
- **Username:** `reviewer1` | **Password:** `password`
- **Username:** `reviewer2` | **Password:** `password`
