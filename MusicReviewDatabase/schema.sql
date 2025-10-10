-- Music Review Database Schema
-- Run this SQL to create the necessary tables

USE gsu;

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    artist_name VARCHAR(255) NOT NULL,
    artist_description TEXT,
    artist_picture VARCHAR(500)
);

-- Albums table
CREATE TABLE IF NOT EXISTS albums (
    album_id INT AUTO_INCREMENT PRIMARY KEY,
    album_title VARCHAR(255) NOT NULL,
    artist_id INT,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
    track_id INT AUTO_INCREMENT PRIMARY KEY,
    track_title VARCHAR(255) NOT NULL,
    track_length INT, -- in seconds
    track_artwork VARCHAR(500),
    album_id INT,
    artist_id INT,
    FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

-- Reviewers table
CREATE TABLE IF NOT EXISTS reviewers (
    reviewer_id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_name VARCHAR(255) NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    review_title VARCHAR(255) NOT NULL,
    review_description TEXT,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    reviewer_id INT,
    track_id INT,
    artist_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES reviewers(reviewer_id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(track_id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

-- Insert some sample data
INSERT INTO artists (artist_name, artist_description, artist_picture) VALUES
('The Beatles', 'British rock band formed in Liverpool in 1960', 'https://via.placeholder.com/300x300/1e1e2e/ffffff?text=The+Beatles'),
('Pink Floyd', 'English rock band known for their progressive and psychedelic music', 'https://via.placeholder.com/300x300/1e1e2e/ffffff?text=Pink+Floyd'),
('Led Zeppelin', 'English rock band formed in London in 1968', 'https://via.placeholder.com/300x300/1e1e2e/ffffff?text=Led+Zeppelin');

INSERT INTO albums (album_title, artist_id) VALUES
('Abbey Road', 1),
('The Dark Side of the Moon', 2),
('Led Zeppelin IV', 3);

INSERT INTO tracks (track_title, track_length, track_artwork, album_id, artist_id) VALUES
('Come Together', 259, 'https://via.placeholder.com/200x200/1e1e2e/ffffff?text=Come+Together', 1, 1),
('Something', 183, 'https://via.placeholder.com/200x200/1e1e2e/ffffff?text=Something', 1, 1),
('Money', 382, 'https://via.placeholder.com/200x200/1e1e2e/ffffff?text=Money', 2, 2),
('Time', 414, 'https://via.placeholder.com/200x200/1e1e2e/ffffff?text=Time', 2, 2),
('Stairway to Heaven', 482, 'https://via.placeholder.com/200x200/1e1e2e/ffffff?text=Stairway+to+Heaven', 3, 3),
('Black Dog', 296, 'https://via.placeholder.com/200x200/1e1e2e/ffffff?text=Black+Dog', 3, 3);

INSERT INTO reviewers (reviewer_name) VALUES
('John Doe'),
('Jane Smith'),
('Mike Johnson');

INSERT INTO reviews (review_title, review_description, star_rating, reviewer_id, track_id, artist_id) VALUES
('Amazing Classic!', 'This song never gets old. The harmonies are incredible.', 5, 1, 1, 1),
('Beautiful Ballad', 'One of the most beautiful love songs ever written.', 5, 2, 2, 1),
('Timeless Masterpiece', 'The guitar solo in this song is legendary.', 5, 3, 3, 2),
('Deep and Meaningful', 'This song makes you think about life and time.', 4, 1, 4, 2),
('Epic Rock Anthem', 'One of the greatest rock songs of all time.', 5, 2, 5, 3),
('Raw Energy', 'Pure rock and roll energy from start to finish.', 4, 3, 6, 3);
