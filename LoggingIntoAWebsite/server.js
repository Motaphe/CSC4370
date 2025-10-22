const express = require("express");
const mysql = require("mysql2/promise");
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'review',
    port: process.env.DB_PORT || 3306
};

// Middleware
app.use(express.static("."));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
    secret: 'my-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database connection
let db;

async function connectDB() {
    const maxRetries = 5;
    const retryDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempting to connect to database (attempt ${attempt}/${maxRetries})...`);
            db = await mysql.createConnection(dbConfig);
            console.log('Connected to MySQL database');
            return;
        } catch (error) {
            console.error(`Database connection attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                console.error('Max retries reached. Database connection failed.');
                process.exit(1);
            }
            
            console.log(`Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;
        
        if (!userName || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const [rows] = await db.execute(
            'SELECT id, username, password FROM users WHERE username = ?',
            [userName]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        
        res.json({ 
            success: true, 
            message: `Welcome back, ${user.username}!`,
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { userName, password, confirmPassword } = req.body;
        
        if (!userName || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if username already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE username = ?',
            [userName]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [userName, hashedPassword]
        );

        res.json({ 
            success: true, 
            message: `Account created successfully! Welcome, ${userName}!`,
            username: userName
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Check authentication status
app.get('/api/auth/check', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            authenticated: true, 
            username: req.session.username,
            userId: req.session.userId
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const [reviews] = await db.execute(`
            SELECT r.*, u.username as author,
                   CASE WHEN r.author_id = ? THEN true ELSE false END as canDelete
            FROM reviews r
            JOIN users u ON r.author_id = u.id
            ORDER BY r.created_at DESC
        `, [req.session.userId || 0]);

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

// Create new review
app.post('/api/reviews', requireAuth, async (req, res) => {
    try {
        const { title, content, rating } = req.body;
        
        if (!title || !content || !rating) {
            return res.status(400).json({ error: 'Title, content, and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const [result] = await db.execute(
            'INSERT INTO reviews (title, content, rating, author_id) VALUES (?, ?, ?, ?)',
            [title, content, rating, req.session.userId]
        );

        res.json({ 
            success: true, 
            message: 'Review created successfully',
            reviewId: result.insertId
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Error creating review' });
    }
});

// Delete review
app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
    try {
        const reviewId = req.params.id;
        
        // Check if review exists and belongs to the user
        const [reviews] = await db.execute(
            'SELECT author_id FROM reviews WHERE id = ?',
            [reviewId]
        );

        if (reviews.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (reviews[0].author_id !== req.session.userId) {
            return res.status(403).json({ error: 'You can only delete your own reviews' });
        }

        await db.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
        
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Error deleting review' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Visit http://localhost:${PORT} to view the website`);
    });
}

startServer().catch(console.error);
