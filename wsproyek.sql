-- Final Revised SQL Schema for ws_proyek
-- Tujuan: Mengurangi redundansi, tetap mendukung semua endpoint proposal,
-- dan mendukung penambahan lagu ke playlist/album tanpa trigger

CREATE DATABASE IF NOT EXISTS db_trashwave;
USE db_trashwave;

-- Artists
DROP TABLE IF EXISTS artists;
CREATE TABLE artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  stage_name VARCHAR(100) NOT NULL,
  bio TEXT,
  verified TINYINT(1) DEFAULT 0,
  follower_count INT DEFAULT 0,
  monthly_listeners INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME
);

-- Users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  profile_picture VARCHAR(255),
  date_of_birth DATE,
  country VARCHAR(50),
  ROLE ENUM('admin','artist','user') DEFAULT 'user',
  subscription_type ENUM('free','premium_lite','premium') DEFAULT 'free',
  streaming_quota INT DEFAULT 0,
  download_quota INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME
);

-- Albums
DROP TABLE IF EXISTS albums;
CREATE TABLE albums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  artist_id INT NOT NULL,
  cover_image VARCHAR(255),
  release_date DATE,
  DESCRIPTION TEXT,
  total_tracks INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  is_single TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

-- Songs
DROP TABLE IF EXISTS songs;
CREATE TABLE songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  artist_id INT NOT NULL,
  album_id INT,
  file_url VARCHAR(255) NOT NULL,
  duration_seconds INT NOT NULL,
  lyrics TEXT,
  play_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  release_date DATE,
  is_explicit TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  FOREIGN KEY (artist_id) REFERENCES artists(id),
  FOREIGN KEY (album_id) REFERENCES albums(id)
);

-- Playlists
DROP TABLE IF EXISTS playlists;
CREATE TABLE playlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  NAME VARCHAR(100) NOT NULL,
  DESCRIPTION TEXT,
  user_id INT NOT NULL,
  cover_image VARCHAR(255),
  is_public TINYINT(1) DEFAULT 1,
  is_official TINYINT(1) DEFAULT 0,
  like_count INT DEFAULT 0,
  total_songs INT DEFAULT 0,
  total_duration INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Playlist Songs
DROP TABLE IF EXISTS playlist_songs;
CREATE TABLE playlist_songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playlist_id INT NOT NULL,
  song_id INT NOT NULL,
  POSITION INT NOT NULL,
  added_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  UNIQUE(playlist_id, song_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id),
  FOREIGN KEY (song_id) REFERENCES songs(id)
);

-- Song Collaborations
DROP TABLE IF EXISTS song_collaborations;
CREATE TABLE song_collaborations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  song_id INT NOT NULL,
  artist_id INT NOT NULL,
  ROLE ENUM('featured','producer','writer','composer') DEFAULT 'featured',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  UNIQUE(song_id, artist_id, ROLE),
  FOREIGN KEY (song_id) REFERENCES songs(id),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

-- Subscription Plans
DROP TABLE IF EXISTS subscription_plans;
CREATE TABLE subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  NAME VARCHAR(50) NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  streaming_limit INT,
  download_limit INT,
  features JSON,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME
);

-- Payment Transactions
DROP TABLE IF EXISTS payment_transactions;
CREATE TABLE payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_plan_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100) UNIQUE,
  STATUS ENUM('pending','completed','failed','cancelled') DEFAULT 'pending',
  payment_date DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id)
);
