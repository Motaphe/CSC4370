const express = require("express");
const app = express();
const mysql = require("mysql");
const path = require("path");

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Database connection - Docker configuration
const conn = mysql.createConnection({
    host: process.env.DB_HOST || "mysql", // Use 'mysql' as hostname in Docker
    user: process.env.DB_USER || "musicuser",
    password: process.env.DB_PASSWORD || "musicpass",
    database: process.env.DB_NAME || "gsu",
    port: process.env.DB_PORT || 3306
});

// Function to connect to database with retry logic
function connectWithRetry() {
    conn.connect(function(err) {
        if (err) {
            console.log("❌ Couldn't connect to MySQL:", err.message);
            console.log("🔄 Retrying connection in 5 seconds...");
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log("✅ Database connection established");
        }
    });
}

// Start connection attempt
connectWithRetry();

// Set up Pug templating
app.set("views", "views");
app.set("view engine", "pug");

// Home route - serve the home page
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Serve static HTML files
app.get("/home", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/musicreview", function(req, res) {
    res.sendFile(path.join(__dirname, "musicreview.html"));
});

app.get("/selectreview", function(req, res) {
    res.sendFile(path.join(__dirname, "selectreview.html"));
});

app.get("/viewreviews", function(req, res) {
    res.sendFile(path.join(__dirname, "view_reviews.html"));
});

// API Routes

// Get all artists for dropdown
app.get("/api/artists", function(req, res) {
    const sql = "SELECT DISTINCT artist_id, artist_name FROM artists ORDER BY artist_name ASC";
    conn.query(sql, function(err, rows) {
        if (err) {
            console.log("Error fetching artists:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(rows);
        }
    });
});

// Get artist information
app.get("/api/artist/:id", function(req, res) {
    const artistId = req.params.id;
    const sql = "SELECT * FROM artists WHERE artist_id = ?";
    conn.query(sql, [artistId], function(err, rows) {
        if (err) {
            console.log("Error fetching artist:", err);
            res.status(500).json({ error: "Database error" });
        } else if (rows.length === 0) {
            res.status(404).json({ error: "Artist not found" });
        } else {
            res.json(rows[0]);
        }
    });
});

// Get reviews for a specific artist
app.get("/api/reviews/:artistId", function(req, res) {
    const artistId = req.params.artistId;
    const sql = `
        SELECT 
            r.review_id,
            r.review_title,
            r.review_description,
            r.star_rating,
            r.created_at,
            rev.reviewer_name,
            t.track_title,
            t.track_length,
            t.track_artwork,
            a.artist_name
        FROM reviews r
        JOIN reviewers rev ON r.reviewer_id = rev.reviewer_id
        JOIN tracks t ON r.track_id = t.track_id
        JOIN artists a ON r.artist_id = a.artist_id
        WHERE r.artist_id = ?
        ORDER BY r.created_at DESC
    `;
    
    conn.query(sql, [artistId], function(err, rows) {
        if (err) {
            console.log("Error fetching reviews:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(rows);
        }
    });
});

// Add new review
app.post("/addreview", function(req, res) {
    const {
        artist_name,
        artist_description,
        artist_picture,
        album_title,
        track_title,
        track_length,
        track_artwork,
        reviewer_name,
        review_title,
        review_description,
        star_rating
    } = req.body;

    // Start transaction
    conn.beginTransaction(function(err) {
        if (err) {
            console.log("Error starting transaction:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Declare variables in the transaction scope
        let artistId;
        let albumId;
        let trackId;
        let reviewerId;
        const getArtistSql = "SELECT artist_id FROM artists WHERE artist_name = ?";
        conn.query(getArtistSql, [artist_name], function(err, artistRows) {
            if (err) {
                return conn.rollback(function() {
                    console.log("Error getting artist:", err);
                    res.status(500).json({ error: "Database error" });
                });
            }

            if (artistRows.length > 0) {
                artistId = artistRows[0].artist_id;
                processReview();
            } else {
                // Create new artist
                const insertArtistSql = "INSERT INTO artists (artist_name, artist_description, artist_picture) VALUES (?, ?, ?)";
                conn.query(insertArtistSql, [artist_name, artist_description, artist_picture], function(err, result) {
                    if (err) {
                        return conn.rollback(function() {
                            console.log("Error creating artist:", err);
                            res.status(500).json({ error: "Database error" });
                        });
                    }
                    artistId = result.insertId;
                    processReview();
                });
            }
        });

        function processReview() {
            // Get or create album
            const getAlbumSql = "SELECT album_id FROM albums WHERE album_title = ? AND artist_id = ?";
            conn.query(getAlbumSql, [album_title, artistId], function(err, albumRows) {
                if (err) {
                    return conn.rollback(function() {
                        console.log("Error getting album:", err);
                        res.status(500).json({ error: "Database error" });
                    });
                }

                if (albumRows.length > 0) {
                    albumId = albumRows[0].album_id;
                    processTrack();
                } else {
                    // Create new album
                    const insertAlbumSql = "INSERT INTO albums (album_title, artist_id) VALUES (?, ?)";
                    conn.query(insertAlbumSql, [album_title, artistId], function(err, result) {
                        if (err) {
                            return conn.rollback(function() {
                                console.log("Error creating album:", err);
                                res.status(500).json({ error: "Database error" });
                            });
                        }
                        albumId = result.insertId;
                        processTrack();
                    });
                }
            });
        }

        function processTrack() {
            // Get or create track
            const getTrackSql = "SELECT track_id FROM tracks WHERE track_title = ? AND artist_id = ?";
            conn.query(getTrackSql, [track_title, artistId], function(err, trackRows) {
                if (err) {
                    return conn.rollback(function() {
                        console.log("Error getting track:", err);
                        res.status(500).json({ error: "Database error" });
                    });
                }

                if (trackRows.length > 0) {
                    trackId = trackRows[0].track_id;
                    processReviewer();
                } else {
                    // Create new track
                    const insertTrackSql = "INSERT INTO tracks (track_title, track_length, track_artwork, album_id, artist_id) VALUES (?, ?, ?, ?, ?)";
                    conn.query(insertTrackSql, [track_title, track_length, track_artwork, albumId, artistId], function(err, result) {
                        if (err) {
                            return conn.rollback(function() {
                                console.log("Error creating track:", err);
                                res.status(500).json({ error: "Database error" });
                            });
                        }
                        trackId = result.insertId;
                        processReviewer();
                    });
                }
            });
        }

        function processReviewer() {
            // Get or create reviewer
            const getReviewerSql = "SELECT reviewer_id FROM reviewers WHERE reviewer_name = ?";
            conn.query(getReviewerSql, [reviewer_name], function(err, reviewerRows) {
                if (err) {
                    return conn.rollback(function() {
                        console.log("Error getting reviewer:", err);
                        res.status(500).json({ error: "Database error" });
                    });
                }

                if (reviewerRows.length > 0) {
                    reviewerId = reviewerRows[0].reviewer_id;
                    createReview();
                } else {
                    // Create new reviewer
                    const insertReviewerSql = "INSERT INTO reviewers (reviewer_name) VALUES (?)";
                    conn.query(insertReviewerSql, [reviewer_name], function(err, result) {
                        if (err) {
                            return conn.rollback(function() {
                                console.log("Error creating reviewer:", err);
                                res.status(500).json({ error: "Database error" });
                            });
                        }
                        reviewerId = result.insertId;
                        createReview();
                    });
                }
            });
        }

        function createReview() {
            // Create the review
            const insertReviewSql = "INSERT INTO reviews (review_title, review_description, star_rating, reviewer_id, track_id, artist_id) VALUES (?, ?, ?, ?, ?, ?)";
            conn.query(insertReviewSql, [review_title, review_description, star_rating, reviewerId, trackId, artistId], function(err, result) {
                if (err) {
                    return conn.rollback(function() {
                        console.log("Error creating review:", err);
                        res.status(500).json({ error: "Database error" });
                    });
                }

                // Commit transaction
                conn.commit(function(err) {
                    if (err) {
                        return conn.rollback(function() {
                            console.log("Error committing transaction:", err);
                            res.status(500).json({ error: "Database error" });
                        });
                    }

                    res.json({ 
                        success: true, 
                        message: "Review added successfully!",
                        reviewId: result.insertId 
                    });
                });
            });
        }
    });
});

// Error handling middleware
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use(function(req, res) {
    res.status(404).json({ error: "Page not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Visit http://localhost:${PORT} to add a review`);
    console.log(`🔍 Visit http://localhost:${PORT}/selectreview to view reviews`);
});
