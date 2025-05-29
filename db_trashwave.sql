-- Database: db_trashwave

CREATE DATABASE IF NOT EXISTS db_trashwave;
USE db_trashwave;

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
  streaming_quota INT DEFAULT 0,
  download_quota INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  api_key TEXT,
  refresh_token TEXT,
  api_level ENUM('free','freemium','premium') NOT NULL DEFAULT 'free',
  api_quota INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME
);

-- API Tier List
DROP TABLE IF EXISTS api_tierlist;
CREATE TABLE api_tierlist (
  api_tier ENUM('free','freemium','premium') NOT NULL,
  api_limit INT DEFAULT NULL,
  api_quota INT DEFAULT NULL,
  PRIMARY KEY (api_tier)
);

-- Data for API Tier List
INSERT INTO api_tierlist (api_tier, api_limit, api_quota) VALUES 
('free', 3, 6),
('freemium', 5, 10),
('premium', -1, -1);

-- API Log
DROP TABLE IF EXISTS api_log;
CREATE TABLE api_log (
  api_log_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  createdAt DATETIME DEFAULT NULL,
  updatedAt DATETIME DEFAULT NULL,
  deletedAt DATETIME DEFAULT NULL,
  PRIMARY KEY (api_log_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

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
  deleted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
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