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
  email_verified TINYINT(1) DEFAULT 0,  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL
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
  endpoints VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  response_status INT,
  response_time_ms INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY (api_log_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Subscription Plans
DROP TABLE IF EXISTS subscription_plans;
CREATE TABLE subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  NAME VARCHAR(50) NOT NULL UNIQUE,
  DESCRIPTION TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_yearly DECIMAL(10,2) DEFAULT NULL,
  streaming_limit INT DEFAULT -1 COMMENT 'Daily streaming limit (-1 for unlimited)',
  download_limit INT DEFAULT 0 COMMENT 'Daily download limit',
  features JSON COMMENT 'Plan features as JSON',
  is_active TINYINT(1) DEFAULT 1,
  trial_period_days INT DEFAULT 0,  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL
);

-- Insert default subscription plans
INSERT INTO subscription_plans (NAME, DESCRIPTION, price, price_monthly, price_yearly, streaming_limit, download_limit, features, trial_period_days) VALUES 
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
  spotify_id VARCHAR(100) UNIQUE,  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
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
  DESCRIPTION TEXT,
  genre VARCHAR(100),
  total_tracks INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  is_single TINYINT(1) DEFAULT 0,
  is_explicit TINYINT(1) DEFAULT 0,
  play_count BIGINT DEFAULT 0,
  like_count INT DEFAULT 0,
  spotify_id VARCHAR(100) UNIQUE,  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
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
  spotify_id VARCHAR(100) UNIQUE,  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
);

-- Playlists
DROP TABLE IF EXISTS playlists;
CREATE TABLE playlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  NAME VARCHAR(200) NOT NULL,
  DESCRIPTION TEXT,
  user_id INT NOT NULL,
  cover_image VARCHAR(255),
  is_public TINYINT(1) DEFAULT 1,
  is_official TINYINT(1) DEFAULT 0,
  like_count INT DEFAULT 0,
  total_songs INT DEFAULT 0,
  total_duration INT DEFAULT 0,  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Playlist Songs (Many-to-Many relationship)
DROP TABLE IF EXISTS playlist_songs;
CREATE TABLE playlist_songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playlist_id INT NOT NULL,
  song_id INT NOT NULL,
  POSITION INT NOT NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_playlist_song (playlist_id, song_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Advertisement System
DROP TABLE IF EXISTS ads;
CREATE TABLE ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  advertiser_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  DESCRIPTION TEXT,
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
  end_date DATETIME,  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
  location_data JSON COMMENT 'Location data as JSON',  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
  STATUS ENUM('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending',
  payment_date DATETIME NOT NULL,
  processed_at DATETIME,
  expires_at DATETIME,
  failure_reason TEXT,
  metadata JSON COMMENT 'Additional payment metadata',  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
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
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_artist (user_id, artist_id),
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
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_song (user_id, song_id),
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
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_playlist (user_id, playlist_id),
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
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  deleted_at DATETIME DEFAULT NULL,
  UNIQUE KEY unique_user_album (user_id, album_id),
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
  download_completed TINYINT(1) DEFAULT 0,  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Add foreign key constraint for users subscription_plan_id
ALTER TABLE users 
ADD CONSTRAINT fk_users_subscription_plan 
FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users
INSERT INTO users (username, email, password_hash, full_name, profile_picture, date_of_birth, country, phone, bio, gender, ROLE, streaming_quota, download_quota, subscription_plan_id, subscription_expires_at, is_active, api_level, api_quota, last_login, email_verified, created_at) VALUES
-- Admin Users
('admin_trashwave', 'admin@trashwave.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'TrashWave Administrator', 'https://cdn.trashwave.id/profiles/admin.jpg', '1990-01-15', 'Indonesia', '+62811234567', 'Platform Administrator', 'other', 'admin', -1, -1, 3, '2025-12-31 23:59:59', 1, 'premium', -1, '2025-06-03 08:30:00', 1, '2024-01-01 00:00:00'),

-- Artist Users
('raisa_official', 'raisa@trashwave.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Raisa Andriana', 'https://cdn.trashwave.id/profiles/raisa.jpg', '1990-06-06', 'Indonesia', '+628123456789', 'Indonesian R&B Singer', 'female', 'artist', -1, -1, 3, '2025-12-31 23:59:59', 1, 'premium', -1, '2025-06-02 20:15:00', 1, '2024-02-15 10:30:00'),
('afgan_official', 'afgan@trashwave.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Afgansyah Reza', 'https://cdn.trashwave.id/profiles/afgan.jpg', '1989-05-27', 'Indonesia', '+628123456790', 'Indonesian Pop Singer', 'male', 'artist', -1, -1, 3, '2025-12-31 23:59:59', 1, 'premium', -1, '2025-06-02 18:45:00', 1, '2024-03-10 14:20:00'),
('isyana_official', 'isyana@trashwave.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Isyana Sarasvati', 'https://cdn.trashwave.id/profiles/isyana.jpg', '1993-05-02', 'Indonesia', '+628123456791', 'Indonesian Pop Classical Singer', 'female', 'artist', -1, -1, 3, '2025-12-31 23:59:59', 1, 'premium', -1, '2025-06-01 22:30:00', 1, '2024-03-20 09:15:00'),
('tulus_official', 'tulus@trashwave.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Muhammad Tulus', 'https://cdn.trashwave.id/profiles/tulus.jpg', '1987-08-20', 'Indonesia', '+628123456792', 'Indonesian Jazz Pop Singer', 'male', 'artist', -1, -1, 3, '2025-12-31 23:59:59', 1, 'premium', -1, '2025-06-02 16:20:00', 1, '2024-04-05 11:45:00'),
('ardhito_official', 'ardhito@trashwave.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ardhito Rifqi Pramono', 'https://cdn.trashwave.id/profiles/ardhito.jpg', '1995-05-22', 'Indonesia', '+628123456793', 'Indonesian Indie Pop Singer', 'male', 'artist', -1, -1, 3, '2025-12-31 23:59:59', 1, 'premium', -1, '2025-06-01 19:10:00', 1, '2024-04-15 13:25:00'),

-- Regular Premium Users
('budi_music', 'budi@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Budi Santoso', 'https://cdn.trashwave.id/profiles/budi.jpg', '1995-08-12', 'Indonesia', '+628123456794', 'Music lover from Jakarta', 'male', 'user', -1, -1, 3, '2025-08-15 23:59:59', 1, 'premium', -1, '2025-06-03 07:45:00', 1, '2024-05-01 16:30:00'),
('sari_melody', 'sari@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sari Melodi', 'https://cdn.trashwave.id/profiles/sari.jpg', '1992-12-03', 'Indonesia', '+628123456795', 'Indie music enthusiast', 'female', 'user', -1, -1, 3, '2025-09-20 23:59:59', 1, 'premium', -1, '2025-06-02 21:15:00', 1, '2024-05-15 09:20:00'),
('andre_beats', 'andre@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Andre Wijaya', 'https://cdn.trashwave.id/profiles/andre.jpg', '1988-03-25', 'Indonesia', '+628123456796', 'Electronic music producer', 'male', 'user', 500, 25, 2, '2025-07-10 23:59:59', 1, 'premium_lite', 500, '2025-06-02 14:30:00', 1, '2024-06-01 12:15:00'),

-- Free Users
('dinda_free', 'dinda@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dinda Permata', NULL, '1998-07-18', 'Indonesia', '+628123456797', 'College student', 'female', 'user', 100, 5, 1, NULL, 1, 'free', 100, '2025-06-03 06:20:00', 1, '2024-08-10 14:45:00'),
('ryan_student', 'ryan@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ryan Pratama', NULL, '1999-11-08', 'Indonesia', '+628123456798', 'High school student', 'male', 'user', 100, 5, 1, NULL, 1, 'free', 100, '2025-06-02 19:45:00', 1, '2024-09-05 10:30:00'),
('maya_casual', 'maya@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maya Sari', NULL, '1994-04-14', 'Indonesia', '+628123456799', 'Casual listener', 'female', 'user', 100, 5, 1, NULL, 1, 'free', 100, '2025-06-01 15:20:00', 1, '2024-10-20 08:15:00');

-- Insert Artists
INSERT INTO artists (user_id, stage_name, real_name, bio, genre, country, social_links, verified, follower_count, monthly_listeners, total_plays, spotify_id, created_at) VALUES
(2, 'Raisa', 'Raisa Andriana', 'Indonesian R&B and pop singer known for her powerful vocals and emotional ballads. Winner of multiple Indonesian music awards.', 'R&B, Pop', 'Indonesia', '{"instagram": "@raisa6690", "twitter": "@raisa6690", "youtube": "RaisaOfficial", "tiktok": "@raisa6690"}', 1, 2500000, 1800000, 450000000, 'raisa_spotify_id', '2024-02-15 10:30:00'),
(3, 'Afgan', 'Afgansyah Reza', 'Indonesian pop singer and songwriter with a distinctive voice. Known for romantic ballads and contemporary pop songs.', 'Pop, R&B', 'Indonesia', '{"instagram": "@afgansyah.reza", "twitter": "@afgansyahreza", "youtube": "AfganOfficial", "tiktok": "@afgansyahreza"}', 1, 1800000, 1200000, 320000000, 'afgan_spotify_id', '2024-03-10 14:20:00'),
(4, 'Isyana Sarasvati', 'Isyana Sarasvati', 'Classical trained pop singer with operatic vocals. Known for blending classical music with contemporary pop.', 'Pop, Classical', 'Indonesia', '{"instagram": "@isyanasarasvati", "twitter": "@isyanasarasvati", "youtube": "IsyanaOfficial", "tiktok": "@isyanasarasvati"}', 1, 1500000, 900000, 280000000, 'isyana_spotify_id', '2024-03-20 09:15:00'),
(5, 'Tulus', 'Muhammad Tulus', 'Indonesian jazz-pop singer known for his smooth voice and heartfelt lyrics. Popular for acoustic and jazz-influenced songs.', 'Jazz, Pop', 'Indonesia', '{"instagram": "@tulus_lius", "twitter": "@tulus_lius", "youtube": "TulusOfficial", "tiktok": "@tulus_lius"}', 1, 2200000, 1500000, 380000000, 'tulus_spotify_id', '2024-04-05 11:45:00'),
(6, 'Ardhito Pramono', 'Ardhito Rifqi Pramono', 'Indonesian indie pop singer-songwriter and actor. Known for his dreamy, lo-fi pop sound and introspective lyrics.', 'Indie Pop, Alternative', 'Indonesia', '{"instagram": "@ardhitopramono", "twitter": "@ardhitopramono", "youtube": "ArdhitoOfficial", "tiktok": "@ardhitopramono"}', 1, 800000, 600000, 150000000, 'ardhito_spotify_id', '2024-04-15 13:25:00');

-- Insert Albums
INSERT INTO albums (title, artist_id, cover_image, release_date, DESCRIPTION, genre, total_tracks, duration_seconds, is_single, is_explicit, play_count, like_count, spotify_id, created_at) VALUES
-- Raisa Albums
('Heart to Heart', 1, 'https://cdn.trashwave.id/covers/raisa_heart_to_heart.jpg', '2011-02-11', 'Debut album featuring emotional ballads and R&B tracks', 'R&B, Pop', 10, 2850, 0, 0, 45000000, 125000, 'raisa_heart_to_heart', '2024-02-15 10:30:00'),
('Let Me Be (I Do)', 1, 'https://cdn.trashwave.id/covers/raisa_let_me_be.jpg', '2016-05-20', 'Second studio album with mature sound and diverse musical styles', 'Pop, R&B', 12, 3420, 0, 0, 38000000, 98000, 'raisa_let_me_be', '2024-02-15 10:35:00'),
('Handmade', 1, 'https://cdn.trashwave.id/covers/raisa_handmade.jpg', '2019-08-16', 'Third album showcasing artistic growth and personal storytelling', 'Pop, Alternative', 11, 3180, 0, 0, 52000000, 142000, 'raisa_handmade', '2024-02-15 10:40:00'),

-- Afgan Albums
('Confession No. 1', 2, 'https://cdn.trashwave.id/covers/afgan_confession1.jpg', '2010-05-17', 'Debut album that established Afgan as a major pop artist', 'Pop, R&B', 8, 2280, 0, 0, 35000000, 89000, 'afgan_confession1', '2024-03-10 14:25:00'),
('The One', 2, 'https://cdn.trashwave.id/covers/afgan_the_one.jpg', '2021-03-12', 'Latest album featuring contemporary pop with electronic elements', 'Pop, Electronic', 10, 2950, 0, 0, 28000000, 76000, 'afgan_the_one', '2024-03-10 14:30:00'),

-- Isyana Albums
('Explore!', 3, 'https://cdn.trashwave.id/covers/isyana_explore.jpg', '2015-05-18', 'Debut album blending pop with classical influences', 'Pop, Classical', 9, 2670, 0, 0, 22000000, 65000, 'isyana_explore', '2024-03-20 09:20:00'),
('Paradox', 3, 'https://cdn.trashwave.id/covers/isyana_paradox.jpg', '2017-09-15', 'Second album exploring deeper musical complexities', 'Pop, Alternative', 11, 3240, 0, 0, 18000000, 54000, 'isyana_paradox', '2024-03-20 09:25:00'),

-- Tulus Albums
('Gajah', 4, 'https://cdn.trashwave.id/covers/tulus_gajah.jpg', '2014-11-17', 'Debut album featuring jazz-influenced pop songs', 'Jazz, Pop', 10, 2890, 0, 0, 42000000, 118000, 'tulus_gajah', '2024-04-05 11:50:00'),
('Monokrom', 4, 'https://cdn.trashwave.id/covers/tulus_monokrom.jpg', '2016-08-01', 'Second album with more mature songwriting', 'Jazz, Pop', 12, 3360, 0, 0, 39000000, 108000, 'tulus_monokrom', '2024-04-05 11:55:00'),
('Manusia', 4, 'https://cdn.trashwave.id/covers/tulus_manusia.jpg', '2022-02-14', 'Latest album exploring human emotions and relationships', 'Jazz, Pop', 9, 2520, 0, 0, 31000000, 87000, 'tulus_manusia', '2024-04-05 12:00:00'),

-- Ardhito Albums
('A Letter to My 17 Year Old Self', 5, 'https://cdn.trashwave.id/covers/ardhito_letter.jpg', '2020-01-17', 'Debut album with dreamy indie pop sound', 'Indie Pop, Alternative', 8, 2160, 0, 0, 15000000, 45000, 'ardhito_letter', '2024-04-15 13:30:00');

-- Insert Songs
INSERT INTO songs (title, artist_id, album_id, file_url, cover_image, duration_seconds, genre, lyrics, play_count, like_count, download_count, release_date, is_explicit, file_size, bitrate, spotify_id, created_at) VALUES
-- Raisa Songs
('Could It Be', 1, 1, 'https://cdn.trashwave.id/audio/raisa_could_it_be.mp3', 'https://cdn.trashwave.id/covers/raisa_heart_to_heart.jpg', 245, 'R&B', 'Could it be that I have found love\nIn the most unexpected way...', 8500000, 45000, 12000, '2011-02-11', 0, 9830400, 320, 'raisa_could_it_be', '2024-02-15 10:30:00'),
('Serba Salah', 1, 1, 'https://cdn.trashwave.id/audio/raisa_serba_salah.mp3', 'https://cdn.trashwave.id/covers/raisa_heart_to_heart.jpg', 267, 'Pop', 'Serba salah kalau aku\nMencintaimu seperti ini...', 12000000, 67000, 18000, '2011-02-11', 0, 10707200, 320, 'raisa_serba_salah', '2024-02-15 10:32:00'),
('LDR', 1, 2, 'https://cdn.trashwave.id/audio/raisa_ldr.mp3', 'https://cdn.trashwave.id/covers/raisa_let_me_be.jpg', 223, 'Pop', 'Long distance relationship\nTidak mudah untuk dijalani...', 15000000, 89000, 25000, '2016-05-20', 0, 8947200, 320, 'raisa_ldr', '2024-02-15 10:35:00'),
('Kali Kedua', 1, 3, 'https://cdn.trashwave.id/audio/raisa_kali_kedua.mp3', 'https://cdn.trashwave.id/covers/raisa_handmade.jpg', 198, 'Pop', 'Untuk kali kedua\nAku mencoba membuka hati...', 18000000, 112000, 32000, '2019-08-16', 0, 7948800, 320, 'raisa_kali_kedua', '2024-02-15 10:40:00'),

-- Afgan Songs  
('Sadis', 2, 4, 'https://cdn.trashwave.id/audio/afgan_sadis.mp3', 'https://cdn.trashwave.id/covers/afgan_confession1.jpg', 234, 'Pop', 'Sadis kamu sadis\nMembuat aku jatuh cinta...', 11000000, 58000, 16000, '2010-05-17', 0, 9388800, 320, 'afgan_sadis', '2024-03-10 14:25:00'),
('Jangan Sampai Tiga Kali', 2, 4, 'https://cdn.trashwave.id/audio/afgan_jangan_sampai.mp3', 'https://cdn.trashwave.id/covers/afgan_confession1.jpg', 276, 'R&B', 'Jangan sampai tiga kali\nKamu pergi dari hidupku...', 9500000, 52000, 14000, '2010-05-17', 0, 11059200, 320, 'afgan_jangan_sampai', '2024-03-10 14:27:00'),
('M.A.L', 2, 5, 'https://cdn.trashwave.id/audio/afgan_mal.mp3', 'https://cdn.trashwave.id/covers/afgan_the_one.jpg', 189, 'Pop', 'M.A.L, make a living\nTapi jangan lupa untuk hidup...', 7200000, 41000, 11000, '2021-03-12', 0, 7579200, 320, 'afgan_mal', '2024-03-10 14:30:00'),

-- Isyana Songs
('Keep Being You', 3, 6, 'https://cdn.trashwave.id/audio/isyana_keep_being_you.mp3', 'https://cdn.trashwave.id/covers/isyana_explore.jpg', 201, 'Pop', 'Keep being you, dont change for anyone\nYoure beautiful just the way you are...', 6800000, 35000, 9500, '2015-05-18', 0, 8064000, 320, 'isyana_keep_being_you', '2024-03-20 09:20:00'),
('Tetap Dalam Jiwa', 3, 6, 'https://cdn.trashwave.id/audio/isyana_tetap_dalam_jiwa.mp3', 'https://cdn.trashwave.id/covers/isyana_explore.jpg', 254, 'Classical Pop', 'Tetap dalam jiwa\nKenangan indah bersamamu...', 8900000, 48000, 13000, '2015-05-18', 0, 10188800, 320, 'isyana_tetap_dalam_jiwa', '2024-03-20 09:22:00'),
('Anganku Anganmu', 3, 7, 'https://cdn.trashwave.id/audio/isyana_anganku_anganmu.mp3', 'https://cdn.trashwave.id/covers/isyana_paradox.jpg', 287, 'Alternative', 'Anganku anganmu\nTerbang tinggi ke angkasa...', 5600000, 31000, 8200, '2017-09-15', 0, 11507200, 320, 'isyana_anganku_anganmu', '2024-03-20 09:25:00'),

-- Tulus Songs
('Gajah', 4, 8, 'https://cdn.trashwave.id/audio/tulus_gajah.mp3', 'https://cdn.trashwave.id/covers/tulus_gajah.jpg', 298, 'Jazz', 'Seperti gajah\nAku tak akan melupakan...', 16000000, 85000, 23000, '2014-11-17', 0, 11948800, 320, 'tulus_gajah_song', '2024-04-05 11:50:00'),
('Sepatu', 4, 8, 'https://cdn.trashwave.id/audio/tulus_sepatu.mp3', 'https://cdn.trashwave.id/covers/tulus_gajah.jpg', 243, 'Pop', 'Sepatu usang penuh debu\nMenemani langkahku...', 14000000, 78000, 21000, '2014-11-17', 0, 9747200, 320, 'tulus_sepatu', '2024-04-05 11:52:00'),
('Monokrom', 4, 9, 'https://cdn.trashwave.id/audio/tulus_monokrom.mp3', 'https://cdn.trashwave.id/covers/tulus_monokrom.jpg', 267, 'Jazz', 'Monokrom warna hidupku\nTanpa dirimu di sini...', 13500000, 72000, 19000, '2016-08-01', 0, 10707200, 320, 'tulus_monokrom_song', '2024-04-05 11:55:00'),
('Ruang Sendiri', 4, 10, 'https://cdn.trashwave.id/audio/tulus_ruang_sendiri.mp3', 'https://cdn.trashwave.id/covers/tulus_manusia.jpg', 234, 'Pop', 'Berikan aku ruang sendiri\nUntuk menyembuhkan luka...', 11000000, 65000, 17000, '2022-02-14', 0, 9388800, 320, 'tulus_ruang_sendiri', '2024-04-05 12:00:00'),

-- Ardhito Songs
('fine today', 5, 11, 'https://cdn.trashwave.id/audio/ardhito_fine_today.mp3', 'https://cdn.trashwave.id/covers/ardhito_letter.jpg', 198, 'Indie Pop', 'Im fine today\nEverything will be okay...', 4500000, 28000, 7500, '2020-01-17', 0, 7948800, 320, 'ardhito_fine_today', '2024-04-15 13:30:00'),
('cigarettes of ours', 5, 11, 'https://cdn.trashwave.id/audio/ardhito_cigarettes.mp3', 'https://cdn.trashwave.id/covers/ardhito_letter.jpg', 234, 'Alternative', 'Cigarettes of ours\nBurning in the summer hours...', 6200000, 35000, 9000, '2020-01-17', 0, 9388800, 320, 'ardhito_cigarettes', '2024-04-15 13:32:00'),
('sudah', 5, 11, 'https://cdn.trashwave.id/audio/ardhito_sudah.mp3', 'https://cdn.trashwave.id/covers/ardhito_letter.jpg', 189, 'Indie Pop', 'Sudah cukup rasanya\nUntuk bersamamu...', 3800000, 24000, 6200, '2020-01-17', 0, 7579200, 320, 'ardhito_sudah', '2024-04-15 13:34:00');

-- Insert Playlists
INSERT INTO playlists (NAME, DESCRIPTION, user_id, cover_image, is_public, is_official, like_count, total_songs, total_duration, created_at) VALUES
-- Official TrashWave Playlists
('Indonesian Pop Hits', 'The biggest Indonesian pop songs of all time', 1, 'https://cdn.trashwave.id/playlists/indo_pop_hits.jpg', 1, 1, 125000, 25, 6750, '2024-02-01 10:00:00'),
('New Indonesian Music', 'Fresh tracks from Indonesian artists', 1, 'https://cdn.trashwave.id/playlists/new_indo.jpg', 1, 1, 89000, 30, 7200, '2024-03-01 10:00:00'),
('Indonesian R&B Collection', 'Smooth R&B tracks from Indonesia', 1, 'https://cdn.trashwave.id/playlists/indo_rnb.jpg', 1, 1, 67000, 20, 5400, '2024-04-01 10:00:00'),
('Indie Indonesia', 'Best indie tracks from Indonesian artists', 1, 'https://cdn.trashwave.id/playlists/indie_indo.jpg', 1, 1, 45000, 18, 4860, '2024-05-01 10:00:00'),

-- User Created Playlists
('My Favorite Songs', 'Personal collection of favorite tracks', 7, 'https://cdn.trashwave.id/playlists/budi_favorites.jpg', 1, 0, 145, 15, 3825, '2024-05-15 14:30:00'),
('Chill Vibes', 'Relaxing songs for study and work', 8, 'https://cdn.trashwave.id/playlists/sari_chill.jpg', 1, 0, 289, 22, 5940, '2024-05-20 16:45:00'),
('Morning Motivation', 'Uplifting songs to start the day', 9, 'https://cdn.trashwave.id/playlists/andre_morning.jpg', 1, 0, 167, 12, 3240, '2024-06-01 08:15:00'),
('Study Playlist', 'Background music for studying', 10, NULL, 0, 0, 23, 8, 2160, '2024-08-15 20:30:00'),
('Workout Mix', 'High energy songs for exercise', 11, NULL, 1, 0, 56, 16, 4320, '2024-09-10 18:20:00');

-- Insert Playlist Songs
INSERT INTO playlist_songs (playlist_id, song_id, POSITION, added_at) VALUES
-- Indonesian Pop Hits
(1, 1, 1, '2024-02-01 10:05:00'), (1, 2, 2, '2024-02-01 10:06:00'), (1, 3, 3, '2024-02-01 10:07:00'),
(1, 4, 4, '2024-02-01 10:08:00'), (1, 5, 5, '2024-02-01 10:09:00'), (1, 6, 6, '2024-02-01 10:10:00');