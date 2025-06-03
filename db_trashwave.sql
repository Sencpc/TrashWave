-- Database: db_trashwave
-- TrashWave Music Streaming Platform Database Schema
-- Updated: 2025-05-29

CREATE DATABASE IF NOT EXISTS db_trashwave;
USE db_trashwave;

-- Disable foreign key checks for clean table recreation
SET FOREIGN_KEY_CHECKS = 0;

-- Users Table (Main user accounts)
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
  phone VARCHAR(20),
  bio TEXT,
  gender ENUM('male', 'female', 'other'),
  ROLE ENUM('admin','artist','user') DEFAULT 'user',
  streaming_quota INT DEFAULT 1000,
  download_quota INT DEFAULT 50,
  subscription_plan_id INT DEFAULT NULL,
  subscription_expires_at DATETIME DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  api_key TEXT,
  refresh_token TEXT,
  api_level ENUM('free','premium_lite','premium') NOT NULL DEFAULT 'free',
  api_quota INT NOT NULL DEFAULT 100,
  last_login DATETIME,
  email_verified TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (ROLE),
  INDEX idx_subscription (subscription_plan_id)
);

-- API Tier List (API rate limiting tiers)
DROP TABLE IF EXISTS api_tierlist;
CREATE TABLE api_tierlist (
  api_tier ENUM('free','premium_lite','premium') NOT NULL,
  api_limit INT DEFAULT NULL COMMENT 'Requests per minute (-1 for unlimited)',
  api_quota INT DEFAULT NULL COMMENT 'Daily quota (-1 for unlimited)',
  features JSON COMMENT 'Additional API features',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (api_tier)
);

-- Insert default API tier data
INSERT INTO api_tierlist (api_tier, api_limit, api_quota, features) VALUES 
('free', 10, 100, '{"search": true, "basic_metadata": true, "low_quality_streams": true}'),
('premium_lite', 30, 500, '{"search": true, "metadata": true, "medium_quality_streams": true, "limited_downloads": true}'),
('premium', -1, -1, '{"search": true, "full_metadata": true, "high_quality_streams": true, "unlimited_downloads": true, "api_access": true}');

-- API Log (Track API usage)
DROP TABLE IF EXISTS api_log;
CREATE TABLE api_log (
  api_log_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  response_status INT,
  response_time_ms INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY (api_log_id),
  INDEX idx_user_id (user_id),
  INDEX idx_endpoint (endpoint),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Subscription Plans
DROP TABLE IF EXISTS subscription_plans;
CREATE TABLE subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_yearly DECIMAL(10,2) DEFAULT NULL,
  streaming_limit INT DEFAULT -1 COMMENT 'Daily streaming limit (-1 for unlimited)',
  download_limit INT DEFAULT 0 COMMENT 'Daily download limit',
  features JSON COMMENT 'Plan features as JSON',
  is_active TINYINT(1) DEFAULT 1,
  trial_period_days INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, price_monthly, price_yearly, streaming_limit, download_limit, features, trial_period_days) VALUES 
('Free', 'Basic access with ads', 0.00, 0.00, 0.00, 100, 5, '{"ads_enabled": true, "audio_quality": "standard", "max_playlists": 5, "offline_mode": false}', 0),
('Premium Lite', 'Ad-free with better quality', 59000.00, 59000.00, 590000.00, 500, 25, '{"ads_enabled": false, "audio_quality": "high", "max_playlists": 20, "offline_mode": true}', 7),
('Premium', 'Unlimited access with premium features', 99000.00, 99000.00, 990000.00, -1, -1, '{"ads_enabled": false, "audio_quality": "lossless", "max_playlists": -1, "offline_mode": true, "exclusive_content": true}', 14);

-- Artists
DROP TABLE IF EXISTS artists;
CREATE TABLE artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  stage_name VARCHAR(100) NOT NULL,
  real_name VARCHAR(100),
  bio TEXT,
  genre VARCHAR(100),
  country VARCHAR(100),
  social_links JSON COMMENT 'Social media links as JSON',
  verified TINYINT(1) DEFAULT 0,
  follower_count INT DEFAULT 0,
  monthly_listeners INT DEFAULT 0,
  total_plays BIGINT DEFAULT 0,
  spotify_id VARCHAR(100) UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_stage_name (stage_name),
  INDEX idx_genre (genre),
  INDEX idx_verified (verified),
  INDEX idx_follower_count (follower_count),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Albums
DROP TABLE IF EXISTS albums;
CREATE TABLE albums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  artist_id INT NOT NULL,
  cover_image VARCHAR(255),
  release_date DATE,
  description TEXT,
  genre VARCHAR(100),
  total_tracks INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  is_single TINYINT(1) DEFAULT 0,
  is_explicit TINYINT(1) DEFAULT 0,
  play_count BIGINT DEFAULT 0,
  like_count INT DEFAULT 0,
  spotify_id VARCHAR(100) UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_title (title),
  INDEX idx_artist_id (artist_id),
  INDEX idx_genre (genre),
  INDEX idx_release_date (release_date),
  INDEX idx_play_count (play_count),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

-- Songs
DROP TABLE IF EXISTS songs;
CREATE TABLE songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  artist_id INT NOT NULL,
  album_id INT DEFAULT NULL,
  file_url VARCHAR(500) NOT NULL,
  cover_image VARCHAR(255),
  duration_seconds INT NOT NULL,
  genre VARCHAR(100),
  lyrics TEXT,
  play_count BIGINT DEFAULT 0,
  like_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  release_date DATE,
  is_explicit TINYINT(1) DEFAULT 0,
  explicit_content TINYINT(1) DEFAULT 0,
  file_size BIGINT DEFAULT 0 COMMENT 'File size in bytes',
  bitrate INT DEFAULT 320 COMMENT 'Audio bitrate',
  spotify_id VARCHAR(100) UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_title (title),
  INDEX idx_artist_id (artist_id),
  INDEX idx_album_id (album_id),
  INDEX idx_genre (genre),
  INDEX idx_play_count (play_count),
  INDEX idx_release_date (release_date),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
);

-- Playlists
DROP TABLE IF EXISTS playlists;
CREATE TABLE playlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  user_id INT NOT NULL,
  cover_image VARCHAR(255),
  is_public TINYINT(1) DEFAULT 1,
  is_official TINYINT(1) DEFAULT 0,
  like_count INT DEFAULT 0,
  total_songs INT DEFAULT 0,
  total_duration INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_name (name),
  INDEX idx_user_id (user_id),
  INDEX idx_public (is_public),
  INDEX idx_official (is_official),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Playlist Songs (Many-to-Many relationship)
DROP TABLE IF EXISTS playlist_songs;
CREATE TABLE playlist_songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playlist_id INT NOT NULL,
  song_id INT NOT NULL,
  position INT NOT NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_playlist_song (playlist_id, song_id),
  INDEX idx_playlist_id (playlist_id),
  INDEX idx_song_id (song_id),
  INDEX idx_position (position),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Advertisement System
DROP TABLE IF EXISTS ads;
CREATE TABLE ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  advertiser_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  audio_url VARCHAR(500),
  target_url VARCHAR(500),
  ad_type ENUM('banner', 'video', 'audio', 'interstitial') NOT NULL DEFAULT 'banner',
  duration INT DEFAULT NULL COMMENT 'Duration in seconds for video/audio ads',
  target_audience JSON COMMENT 'Targeting criteria as JSON',
  budget DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  cost_per_view DECIMAL(5,4) NOT NULL DEFAULT 0.01,
  total_views INT DEFAULT 0,
  total_clicks INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  is_active TINYINT(1) DEFAULT 1,
  start_date DATETIME,
  end_date DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_advertiser_id (advertiser_id),
  INDEX idx_ad_type (ad_type),
  INDEX idx_active (is_active),
  INDEX idx_dates (start_date, end_date),
  FOREIGN KEY (advertiser_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ad Views/Interactions Tracking
DROP TABLE IF EXISTS ad_views;
CREATE TABLE ad_views (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ad_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  view_type ENUM('impression', 'click', 'complete_view') NOT NULL DEFAULT 'impression',
  view_duration INT DEFAULT NULL COMMENT 'Duration watched in seconds',
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  device_info JSON COMMENT 'Device information as JSON',
  location_data JSON COMMENT 'Location data as JSON',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ad_id (ad_id),
  INDEX idx_user_id (user_id),
  INDEX idx_view_type (view_type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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
  payment_provider VARCHAR(50),
  transaction_id VARCHAR(100) UNIQUE,
  external_transaction_id VARCHAR(100),
  status ENUM('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending',
  payment_date DATETIME NOT NULL,
  processed_at DATETIME,
  expires_at DATETIME,
  failure_reason TEXT,
  metadata JSON COMMENT 'Additional payment metadata',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_subscription_plan_id (subscription_plan_id),
  INDEX idx_status (status),
  INDEX idx_payment_date (payment_date),
  INDEX idx_transaction_id (transaction_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

-- User Interactions: Following Artists
DROP TABLE IF EXISTS user_follow_artists;
CREATE TABLE user_follow_artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  artist_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_artist (user_id, artist_id),
  INDEX idx_user_id (user_id),
  INDEX idx_artist_id (artist_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

-- User Interactions: Liking Songs
DROP TABLE IF EXISTS user_like_songs;
CREATE TABLE user_like_songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_song (user_id, song_id),
  INDEX idx_user_id (user_id),
  INDEX idx_song_id (song_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- User Interactions: Liking Playlists
DROP TABLE IF EXISTS user_like_playlists;
CREATE TABLE user_like_playlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  playlist_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_playlist (user_id, playlist_id),
  INDEX idx_user_id (user_id),
  INDEX idx_playlist_id (playlist_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

-- User Interactions: Liking Albums
DROP TABLE IF EXISTS user_like_albums;
CREATE TABLE user_like_albums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  album_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_album (user_id, album_id),
  INDEX idx_user_id (user_id),
  INDEX idx_album_id (album_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- User Downloads Tracking
DROP TABLE IF EXISTS user_downloads;
CREATE TABLE user_downloads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  download_quality ENUM('standard', 'high', 'lossless') DEFAULT 'standard',
  file_size BIGINT DEFAULT 0,
  download_completed TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_song_id (song_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Add foreign key constraint for users subscription_plan_id
ALTER TABLE users 
ADD CONSTRAINT fk_users_subscription_plan 
FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create some basic indexes for performance
CREATE INDEX idx_songs_search ON songs(title, artist_id);
CREATE INDEX idx_albums_search ON albums(title, artist_id);
CREATE INDEX idx_artists_search ON artists(stage_name, real_name);
CREATE INDEX idx_playlists_search ON playlists(name, user_id);

-- Create full-text search indexes (optional, for better search performance)
-- ALTER TABLE songs ADD FULLTEXT(title, lyrics);
-- ALTER TABLE albums ADD FULLTEXT(title, description);
-- ALTER TABLE artists ADD FULLTEXT(stage_name, real_name, bio);
-- ALTER TABLE playlists ADD FULLTEXT(name, description);