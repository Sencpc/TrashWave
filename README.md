# TrashWave Music Streaming API

A comprehensive music streaming platform backend with user authentication, role-based authorization, Spotify integration, subscription management, streaming quota control, and advanced download tracking.

**Original Proposal**: [View Project Proposal](https://docs.google.com/document/d/1bBqV-fQcDU5Wm12X_9_NKSMbVuCtoXrvahUYLwm_zGw/edit?usp=sharing)

## 🚀 Features

- **User Management**: Registration, authentication, profile management with JWT tokens
- **Role-Based Access**: Admin, Artist, and User roles with specific permissions and middleware protection
- **Music Content**: Songs, albums, playlists with full CRUD operations and file uploads
- **Social Features**: Follow artists, like/unlike songs/albums/playlists with comprehensive tracking
- **Subscription System**: Three-tier system (Free, Premium Lite, Premium) with quota management
- **Streaming Quotas**: Real-time quota decrementation for non-premium users when streaming songs
- **Download System**: Advanced download tracking with quota management, file quality, and completion status
- **Spotify Integration**: Complete Spotify Web API integration for search, tracks, albums, artists, and playlists
- **Ad System**: Full ad management system with view/click tracking and analytics
- **Analytics**: Comprehensive admin dashboard with user, content, and revenue statistics
- **File Upload**: Support for audio files (MP3, WAV, FLAC, M4A) and images (JPEG, JPG, PNG)
- **Rate Limiting**: Configurable API protection with different limits per endpoint category
- **Database**: MySQL with Sequelize ORM, proper associations, and soft deletes

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sencpc/TrashWave.git
   cd TrashWave
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=trashwave_db

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   JWT_EXPIRES_IN=24h
   REFRESH_TOKEN_EXPIRES_IN=7d

   # Server Configuration
   NODE_ENV=development
   PORT=3000

   # Spotify API (Optional)
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

   # Rate Limiting
   API_RATE_LIMIT_WINDOW=15
   API_RATE_LIMIT_MAX=100
   ```

4. **Database Setup**

   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE trashwave_db;
   exit

   # Sync database tables
   npm run db:sync
   ```

5. **Start the server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

Once the server is running, visit:

- **API Documentation**: `http://localhost:3000/api/v1/docs`
- **Health Check**: `http://localhost:3000/health`

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **User**: Basic features (listen, like, create playlists)
- **Artist**: Content creation (upload songs, manage albums)
- **Admin**: Full platform management

## 📁 Project Structure

```
TrashWave/
├── src/
│   ├── config/          # Configuration files (database, environment)
│   ├── controller/      # Request handlers for all endpoints
│   │   ├── cAccount.js  # Account management (register, login, profile)
│   │   ├── cSong.js     # Song operations (CRUD, play, download, Spotify)
│   │   ├── cArtist.js   # Artist management (registration, profiles, follows)
│   │   ├── cAlbum.js    # Album operations (CRUD, song management)
│   │   ├── cPlaylist.js # Playlist operations (CRUD, song management)
│   │   ├── cUser.js     # User profile and relationship management
│   │   ├── cAdmin.js    # Admin dashboard and management functions
│   │   ├── cSubscription.js # Subscription and payment handling
│   │   ├── cAd.js       # Advertisement management and analytics
│   │   ├── cSpotify.js  # Spotify API integration
│   │   └── cDocs.js     # API documentation controller
│   ├── middleware/      # Custom middleware functions
│   │   ├── auth.js      # JWT authentication and role authorization
│   │   └── rateLimiter.js # API rate limiting configuration
│   ├── Model/          # Sequelize database models
│   │   ├── mAccount.js  # User account model
│   │   ├── mSong.js     # Song model with associations
│   │   ├── mArtist.js   # Artist model with user relationship
│   │   ├── mAlbum.js    # Album model with song relationships
│   │   ├── mPlaylist.js # Playlist model with song relationships
│   │   ├── mUserDownload.js # Download tracking model
│   │   ├── mUserLikeSong.js # User-song like relationships
│   │   ├── mAd.js       # Advertisement model
│   │   └── mIndex.js    # Model registry and associations
│   ├── routes/         # API route definitions
│   │   ├── rAccount.js  # Account routes (/api/v1/account)
│   │   ├── rSong.js     # Song routes (/api/v1/songs)
│   │   ├── rArtist.js   # Artist routes (/api/v1/artists)
│   │   ├── rAlbum.js    # Album routes (/api/v1/albums)
│   │   ├── rPlaylist.js # Playlist routes (/api/v1/playlists)
│   │   ├── rUser.js     # User routes (/api/v1/users)
│   │   ├── rAdmin.js    # Admin routes (/api/v1/admin)
│   │   ├── rSubscription.js # Subscription routes (/api/v1/subscriptions)
│   │   ├── rAd.js       # Ad routes (/api/v1/ads)
│   │   └── rSpotify.js  # Spotify routes (/api/v1/spotify)
│   ├── utils/          # Utility functions and helpers
│   │   ├── spotifyAPI.js # Spotify Web API integration
│   │   └── logger.js    # Request logging utilities
│   └── validation/     # Input validation schemas (Joi)
├── storage/            # File uploads (auto-created)
│   ├── songs/          # Audio file storage
│   ├── albums/         # Album cover images
│   ├── playlists/      # Playlist cover images
│   ├── ads/            # Advertisement media files
│   └── {username}/     # User profile pictures
├── db_trashwave.sql   # Complete database schema with test data
├── .env              # Environment variables (create from template)
├── index.js          # Main application entry point
└── package.json      # Dependencies and scripts
```

## 🛡️ API Endpoints

### Authentication & Account Management

- `POST /api/v1/account/register` - Register new user account with bcrypt password hashing
- `POST /api/v1/account/login` - User login with JWT token generation
- `GET /api/v1/account/logout` - User logout and token invalidation
- `PUT /api/v1/account/profile` - Update user profile with file upload support
- `POST /api/v1/account/subscribe` - User subscription management
- `POST /api/v1/account/admin` - Create admin account (restricted)
- `GET /api/v1/account/user` - Get user by API key (header: x-api-key)
- `GET /api/v1/account/user/:username` - Get user profile by username (public)
- `GET /api/v1/account/quota` - Get user's current streaming/download quotas

### Songs Management

**Public Endpoints:**

- `GET /api/v1/songs` - Get all songs with pagination, search, genre filtering
- `GET /api/v1/songs/:id` - Get detailed song information with artist and album data
- `GET /api/v1/songs/search/spotify` - Search songs on Spotify API
- `GET /api/v1/songs/spotify/:trackId` - Get specific Spotify track details
- `GET /api/v1/songs/spotify/tracks/:trackIds` - Get multiple Spotify tracks

**Authenticated Endpoints:**

- `POST /api/v1/songs/:id/like` - Like/unlike a song (toggles user preference)
- `POST /api/v1/songs/:id/play` - Record song play and decrement streaming quota for non-premium users
- `POST /api/v1/songs/:id/download` - Download song with quota validation and tracking

**Artist/Admin Only:**

- `POST /api/v1/songs` - Upload new song with audio file and metadata
- `PUT /api/v1/songs/:id` - Update song information and files
- `DELETE /api/v1/songs/:id` - Soft delete song (sets deleted_at timestamp)

### Artists Management

**Public Endpoints:**

- `GET /api/v1/artists` - Get all artists with pagination and search filters
- `GET /api/v1/artists/:name` - Get artist profile by stage name
- `GET /api/v1/artists/:name/songs` - Get all songs by specific artist
- `GET /api/v1/artists/:name/albums` - Get all albums by specific artist
- `POST /api/v1/artists/register` - Register new artist account

**Authenticated Endpoints:**

- `POST /api/v1/artists/:name/follow` - Follow/unfollow artist (updates follower count)

**Artist Only:**

- `PUT /api/v1/artists/:name` - Update artist profile and information

**Admin Only:**

- `DELETE /api/v1/artists/:name` - Ban/delete artist account
- `PUT /api/v1/artists/:name/verify` - Verify artist account status

### Albums Management

**Public Endpoints:**

- `GET /api/v1/albums` - Get all albums with pagination and filtering
- `GET /api/v1/albums/:id` - Get album details with track listing
- `GET /api/v1/albums/:id/songs` - Get all songs in specific album
- `GET /api/v1/albums/search/spotify` - Search albums on Spotify
- `GET /api/v1/albums/spotify/:albumId` - Get Spotify album details
- `GET /api/v1/albums/spotify/albums/:albumIds` - Get multiple Spotify albums

**Authenticated Endpoints:**

- `POST /api/v1/albums/:id/like` - Like/unlike album

**Artist/Admin Only:**

- `POST /api/v1/albums` - Create new album with cover image upload
- `PUT /api/v1/albums/:id` - Update album information
- `DELETE /api/v1/albums/:id` - Delete album
- `POST /api/v1/albums/:id/songs/:songId` - Add song to album
- `DELETE /api/v1/albums/:id/songs/:songId` - Remove song from album

### Playlists Management

**Public Endpoints:**

- `GET /api/v1/playlists` - Get public playlists with search and filtering
- `GET /api/v1/playlists/:id` - Get playlist details with song list
- `GET /api/v1/playlists/search/spotify` - Search playlists on Spotify
- `GET /api/v1/playlists/search/spotify/multiple` - Multi-type Spotify search
- `GET /api/v1/playlists/spotify/:playlistId` - Get Spotify playlist details

**Authenticated Endpoints:**

- `POST /api/v1/playlists` - Create new playlist with cover image upload
- `PUT /api/v1/playlists/:id` - Update playlist (owner only)
- `DELETE /api/v1/playlists/:id` - Delete playlist (owner only)
- `POST /api/v1/playlists/:id/like` - Like/unlike playlist
- `POST /api/v1/playlists/:id/songs` - Add song to playlist
- `DELETE /api/v1/playlists/:id/songs/:songId` - Remove song from playlist

### User Management

**Admin Only:**

- `GET /api/v1/users` - Get all users with advanced filtering and search
- `PUT /api/v1/users/:id` - Update any user's information
- `DELETE /api/v1/users/:id` - Delete user account

**Authenticated Endpoints:**

- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/:id` - Get user profile by ID
- `GET /api/v1/users/:id/playlists` - Get user's playlists
- `GET /api/v1/users/:id/following` - Get user's followed artists
- `GET /api/v1/users/:id/liked-songs` - Get user's liked songs
- `GET /api/v1/users/:id/liked-albums` - Get user's liked albums
- `GET /api/v1/users/:id/downloads` - Get user's download history
- `POST /api/v1/users/:id/subscribe` - Subscribe user to subscription plan
- `GET /api/v1/users/:id/subscription` - Get user's current subscription details

### Admin Dashboard & Management

**All admin endpoints require admin authentication:**

**Dashboard & Analytics:**

- `GET /api/v1/admin/dashboard` - Get comprehensive dashboard statistics
- `GET /api/v1/admin/users` - Advanced user management with filtering
- `GET /api/v1/admin/artists` - Artist management with verification status
- `GET /api/v1/admin/content` - Content overview (songs, albums, playlists)
- `GET /api/v1/admin/transactions` - Payment transaction management
- `GET /api/v1/admin/api-logs` - API usage monitoring and logs

**Subscription Management:**

- `POST /api/v1/admin/subscription-plans` - Create new subscription plans
- `PUT /api/v1/admin/subscription-plans/:id` - Update subscription plans
- `DELETE /api/v1/admin/subscription-plans/:id` - Delete subscription plans

**User Management:**

- `POST /api/v1/admin/users/:id/ban` - Ban/unban user accounts

**Spotify Integration Management:**

- `GET /api/v1/admin/spotify/search` - Admin Spotify search for content management
- `GET /api/v1/admin/spotify/analytics` - Spotify integration analytics

### Subscription Management

**Public Endpoints:**

- `GET /api/v1/subscriptions/plans` - Get all available subscription plans

**Authenticated Endpoints:**

- `POST /api/v1/subscriptions/subscribe` - Subscribe to a subscription plan
- `GET /api/v1/subscriptions/current` - Get current user's subscription
- `GET /api/v1/subscriptions/transactions` - Get user's transaction history

### Advertisement System

**Public Endpoints:**

- `GET /api/v1/ads` - Get all active advertisements
- `GET /api/v1/ads/:id` - Get specific advertisement details

**User Interaction (Can be anonymous):**

- `POST /api/v1/ads/:id/watch` - Record ad view/impression
- `POST /api/v1/ads/:id/click` - Record ad click interaction

**Authenticated Endpoints (Advertisers/Admin):**

- `POST /api/v1/ads` - Create new advertisement with media upload
- `PUT /api/v1/ads/:id` - Update advertisement content
- `DELETE /api/v1/ads/:id` - Delete advertisement
- `GET /api/v1/ads/:id/analytics` - Get advertisement performance analytics

### Spotify Integration

**Public Spotify API Endpoints:**

**Universal Search:**

- `GET /api/v1/spotify/search` - Universal Spotify search (tracks, albums, artists, playlists)
- `GET /api/v1/spotify/search/tracks` - Search specifically for tracks
- `GET /api/v1/spotify/search/albums` - Search specifically for albums
- `GET /api/v1/spotify/search/artists` - Search specifically for artists
- `GET /api/v1/spotify/search/playlists` - Search specifically for playlists

**Track Endpoints:**

- `GET /api/v1/spotify/tracks/:trackId` - Get Spotify track by ID
- `GET /api/v1/spotify/tracks` - Get multiple Spotify tracks by IDs

**Album Endpoints:**

- `GET /api/v1/spotify/albums/:albumId` - Get Spotify album by ID
- `GET /api/v1/spotify/albums` - Get multiple Spotify albums by IDs

**Artist Endpoints:**

- `GET /api/v1/spotify/artists/:artistId` - Get Spotify artist by ID
- `GET /api/v1/spotify/artists` - Get multiple Spotify artists by IDs

**Playlist Endpoints:**

- `GET /api/v1/spotify/playlists/:playlistId` - Get Spotify playlist by ID

### API Documentation

- `GET /api/v1/docs` - Complete interactive API documentation with examples and schemas

## 💳 Subscription Plans & Quotas

| Plan             | Price | Monthly Features                                                                         |
| ---------------- | ----- | ---------------------------------------------------------------------------------------- |
| **Free**         | $0    | 5 downloads/day • 3 playlists • Limited streaming quota • Ads enabled • Standard quality |
| **Premium Lite** | $4.99 | 50 downloads/day • 20 playlists • Increased streaming quota • Ad-free • High quality     |
| **Premium**      | $9.99 | Unlimited downloads • Unlimited playlists • Unlimited streaming • Ad-free • Lossless     |

### Quota Management System

- **Streaming Quotas**: Automatically decremented when non-premium users play songs
- **Download Quotas**: Daily limits based on subscription tier with reset mechanism
- **Real-time Tracking**: Live quota monitoring with remaining count in API responses
- **Quality Tiers**: Different audio quality levels based on subscription status
- **Download History**: Complete tracking with file size, quality, and completion status

## 🔒 Authentication & Authorization

### JWT Token System

- **Access Tokens**: 24-hour expiration with user role and permissions
- **Refresh Tokens**: 7-day expiration for token renewal
- **Secure Headers**: Bearer token authentication in Authorization header
- **Role-based Middleware**: Automatic permission checking for protected endpoints

### User Roles & Permissions

| Role       | Permissions                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------- |
| **User**   | Stream music, create playlists, like content, follow artists, download with quota limits    |
| **Artist** | All user permissions + upload songs/albums, manage own content, artist profile management   |
| **Admin**  | Full platform access + user management, content moderation, analytics, subscription control |

## 📊 Rate Limits & Security

### API Rate Limiting (Per IP Address)

| Endpoint Category     | Limit        | Window     |
| --------------------- | ------------ | ---------- |
| **General API**       | 100 requests | 15 minutes |
| **Authentication**    | 5 requests   | 15 minutes |
| **File Uploads**      | 20 requests  | 1 hour     |
| **Search Operations** | 30 requests  | 1 minute   |
| **Ad Interactions**   | 10 requests  | 1 minute   |

### Security Features

- **Bcrypt Password Hashing**: Salt rounds of 10 for secure password storage
- **Input Validation**: Joi schemas for all request validation
- **File Upload Security**: Type validation, size limits, and secure storage
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **CORS Configuration**: Configurable cross-origin resource sharing

## 🧪 Testing & Development

### Available Scripts

```bash
# Development with auto-reload
npm run dev

# Production mode
npm start

# Database operations
npm run db:sync    # Safe sync, preserves data
npm run db:force   # Force sync, drops tables
npm run db:drop    # Drop all tables

# Testing
npm test

# Initial setup
npm run setup
```

### Test Data & Credentials

The database includes comprehensive test data:

- **12 Test Accounts**: 1 admin, 5 artists, 6 regular users
- **Default Password**: `password` (for all test accounts)
- **Sample Content**: Songs, albums, playlists with proper associations
- **Subscription Data**: All three subscription tiers represented

### Development Guidelines

1. **Environment**: Use `npm run dev` for development with nodemon auto-reload
2. **Logging**: Check console output and logs for debugging information
3. **File Uploads**: Files stored in `storage/` directory with organized structure
4. **API Testing**: Use the `/api/v1/docs` endpoint for interactive documentation
5. **Database**: Use soft deletes (deleted_at) instead of hard deletes

## 🔧 Database Commands

```bash
# Sync database (safe, preserves data)
npm run db:sync

# Force sync (WARNING: drops all tables)
npm run db:force

# Drop all tables
npm run db:drop
```

## 🎵 File Upload Specifications

### Audio Files (Songs)

- **Supported Formats**: MP3, WAV, FLAC, M4A
- **Maximum Size**: 50MB per file
- **Storage Location**: `storage/songs/`
- **Quality Requirements**: Minimum 128kbps for MP3, lossless for FLAC
- **Metadata Support**: Artist, album, genre, duration auto-extraction

### Image Files (Covers & Profiles)

- **Supported Formats**: JPEG, JPG, PNG
- **Maximum Size**: 5MB per file
- **Storage Locations**:
  - Profile pictures: `storage/{username}/profile.{ext}`
  - Album covers: `storage/albums/cover/`
  - Playlist covers: `storage/playlists/cover/`
  - Ad media: `storage/ads/image/` and `storage/ads/video/`

## 🌐 Spotify Integration Features

### Complete Web API Coverage

- **Search Functionality**: Universal search across tracks, albums, artists, and playlists
- **Detailed Metadata**: Full track information, artist bios, album details
- **Market Support**: Geographic market filtering for content availability
- **Bulk Operations**: Multiple item retrieval with single API calls
- **Real-time Data**: Live data from Spotify's catalog

### Integration Benefits

- **Content Discovery**: Enhanced search capabilities beyond local database
- **Metadata Enrichment**: Automatic artist and album information
- **User Experience**: Familiar Spotify search interface
- **Content Verification**: Cross-reference local content with Spotify catalog

## 📈 Analytics & Monitoring

### Admin Dashboard Metrics

- **User Statistics**: Total users, registrations trends, active users
- **Content Analytics**: Songs, albums, playlists counts and growth
- **Revenue Tracking**: Subscription revenue, payment transactions
- **Geographic Distribution**: User distribution by subscription tier
- **API Usage**: Endpoint usage statistics and performance metrics

### Advertisement Analytics

- **View Tracking**: Impression counts and view duration
- **Click Analytics**: Click-through rates and engagement metrics
- **Revenue Reports**: Ad revenue and performance by campaign
- **Target Demographics**: User engagement by demographics

## 💾 Database Architecture

### Core Models & Relationships

- **Users**: Account management with role-based permissions
- **Artists**: Extended user profiles with verification status
- **Songs**: Audio content with metadata and file references
- **Albums**: Song collections with cover art and release info
- **Playlists**: User-curated song collections
- **Subscriptions**: Payment plans and transaction tracking
- **Downloads**: User download history with quota tracking
- **Ads**: Advertisement content and analytics tracking

### Advanced Features

- **Soft Deletes**: Data preservation with `deleted_at` timestamps
- **Audit Trails**: Complete API usage logging with `ApiLog` model
- **Relationship Integrity**: Proper foreign key constraints and associations
- **Performance Optimization**: Indexed queries and pagination support

## 📝 Development Notes

### Recent Updates & Fixes

- **✅ Authentication System**: JWT tokens with bcrypt password hashing (salt rounds: 10)
- **✅ Sequelize Associations**: Fixed alias mismatches between Song-Artist-Album models
- **✅ Streaming Quotas**: Real-time quota decrementation for non-premium users during song playback
- **✅ Download System**: Enhanced download tracking with file quality, size, and completion status
- **✅ Spotify Integration**: Complete Web API integration with proper credential configuration
- **✅ Database Schema**: Corrected foreign key mappings and column naming consistency
- **✅ File Uploads**: Comprehensive support for audio files and images with validation
- **✅ Rate Limiting**: Implemented tiered rate limiting for different endpoint categories

### Known Features & Capabilities

1. **Quota Management**: Automatic streaming and download quota tracking
2. **Role-Based Access**: Middleware-enforced permissions for all endpoints
3. **Soft Deletes**: Data preservation with timestamp-based deletion
4. **File Management**: Organized storage with type-specific directories
5. **API Documentation**: Auto-generated documentation at `/api/v1/docs`
6. **Cross-Origin Support**: Configurable CORS for web application integration

### Configuration Requirements

```env
# Essential Environment Variables
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=trashwave_db

JWT_SECRET=your_super_secret_jwt_key_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Spotify Integration (Optional but Recommended)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

NODE_ENV=development
PORT=3000
```

## 🤝 Contributing

### Development Workflow

1. **Fork the Repository**

   ```bash
   git clone https://github.com/Sencpc/TrashWave.git
   cd TrashWave
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Setup**

   ```bash
   npm install
   cp .env.example .env  # Configure your environment
   npm run db:sync       # Initialize database
   npm run dev          # Start development server
   ```

4. **Code Standards**

   - Follow existing code style and patterns
   - Use descriptive variable and function names
   - Add comments for complex business logic
   - Implement proper error handling
   - Include input validation for all endpoints

5. **Testing Requirements**

   - Test all new endpoints with various scenarios
   - Verify authentication and authorization works correctly
   - Check quota and rate limiting functionality
   - Test file upload operations with different file types

6. **Submit Pull Request**
   - Ensure all tests pass
   - Update documentation if needed
   - Provide clear description of changes
   - Reference related issues

### Code Architecture Guidelines

- **Controllers**: Handle request/response logic only
- **Models**: Define database schema and relationships
- **Middleware**: Implement cross-cutting concerns (auth, validation, rate limiting)
- **Utils**: Create reusable helper functions
- **Routes**: Define endpoint paths and attach middleware

## 🔍 API Response Format

### Successful Responses

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data object
  },
  "pagination": {
    // For paginated responses
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Responses

```json
{
  "success": false,
  "error": "Error message description",
  "details": "Additional error details",
  "timestamp": "2025-06-03T10:30:00.000Z"
}
```

### Common HTTP Status Codes

- **200 OK**: Successful operation
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## 📱 Client Integration Examples

### Authentication Flow

```javascript
// User login
const loginResponse = await fetch("/api/v1/account/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password",
  }),
});

const { token } = await loginResponse.json();

// Use token for authenticated requests
const songsResponse = await fetch("/api/v1/songs", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### File Upload Example

```javascript
// Upload song with cover image
const formData = new FormData();
formData.append("audio_file", audioFile);
formData.append("cover_image", coverFile);
formData.append("title", "Song Title");
formData.append("artist_id", "1");

const uploadResponse = await fetch("/api/v1/songs", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

### Pagination Handling

```javascript
// Get paginated results
const fetchSongs = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/v1/songs?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  return {
    songs: data.songs,
    pagination: data.pagination,
  };
};
```

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support & Troubleshooting

### Common Issues & Solutions

**Database Connection Issues:**

```bash
# Verify MySQL is running
systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Test database connection
mysql -h localhost -u your_db_user -p trashwave_db
```

**File Upload Issues:**

- Check `storage/` directory permissions (should be writable)
- Verify file size limits in your environment
- Ensure supported file formats (MP3, WAV, FLAC, M4A for audio)

**Spotify Integration Issues:**

- Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env`
- Check Spotify Developer Console for API status
- Ensure credentials have proper permissions

**Authentication Problems:**

- Verify JWT_SECRET is properly set and consistent
- Check token expiration times
- Ensure proper Authorization header format: `Bearer <token>`

### Getting Help

- **API Documentation**: Visit `http://localhost:3000/api/v1/docs` for interactive docs
- **Server Logs**: Check console output for detailed error messages
- **Database Logs**: Review MySQL logs for database-related issues
- **GitHub Issues**: Report bugs and feature requests on the repository
- **Health Check**: Monitor `http://localhost:3000/health` for service status

### Performance Monitoring

```bash
# Check API response times
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3000/api/v1/songs

# Monitor database connections
SHOW PROCESSLIST; # In MySQL console

# Check file system usage
df -h storage/  # Monitor storage directory size
```

## 🚀 Deployment & Production

### Production Checklist

1. **Environment Configuration**

   ```bash
   NODE_ENV=production
   PORT=3000
   # Use strong, unique JWT secrets
   # Configure production database credentials
   ```

2. **Process Management**

   ```bash
   # Install PM2 for process management
   npm install -g pm2

   # Start application with PM2
   pm2 start index.js --name "trashwave-api"
   pm2 startup
   pm2 save
   ```

3. **Reverse Proxy Setup (nginx)**

   ```nginx
   server {
       listen 80;
       server_name your-api-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Certificate Configuration**

   ```bash
   # Using Certbot for Let's Encrypt
   certbot --nginx -d your-api-domain.com
   ```

5. **Database Optimization**

   - Set up regular backups
   - Configure MySQL performance settings
   - Monitor database connections and query performance

6. **Monitoring & Logging**
   - Set up application monitoring (e.g., New Relic, DataDog)
   - Configure log rotation and centralized logging
   - Monitor API endpoints and performance metrics

### Performance Considerations

- **File Storage**: Consider cloud storage (AWS S3, Google Cloud) for production file uploads
- **CDN**: Implement CDN for static file delivery and improved global performance
- **Caching**: Add Redis for session management and frequently accessed data
- **Load Balancing**: Use multiple application instances behind a load balancer
- **Database Scaling**: Consider read replicas for high-traffic scenarios

## 📈 Feature Roadmap

### Upcoming Features

- **🎵 Real-time Streaming**: WebSocket-based live audio streaming
- **🔊 Audio Processing**: Server-side audio transcoding and quality optimization
- **📱 Mobile SDK**: Native mobile application support libraries
- **🌍 Internationalization**: Multi-language support and localization
- **🤖 AI Recommendations**: Machine learning-based content discovery
- **📊 Advanced Analytics**: Enhanced user behavior tracking and insights
- **💬 Social Features**: User comments, reviews, and social sharing
- **🎮 Gamification**: User achievements, points, and reward systems

### Integration Possibilities

- **Payment Gateways**: Stripe, PayPal, regional payment providers
- **Cloud Storage**: AWS S3, Google Cloud Storage, Azure Blob Storage
- **CDN Integration**: CloudFlare, AWS CloudFront for global content delivery
- **Email Services**: SendGrid, Mailgun for user notifications
- **Push Notifications**: Firebase Cloud Messaging, OneSignal
- **Social Login**: Google, Facebook, Apple OAuth integration

## 🏗️ Technical Specifications

### Server Requirements

**Minimum:**

- CPU: 2 cores, 2.0 GHz
- RAM: 4GB
- Storage: 50GB SSD
- Network: 100 Mbps

**Recommended:**

- CPU: 4+ cores, 3.0+ GHz
- RAM: 8GB+
- Storage: 200GB+ SSD
- Network: 1 Gbps

### Dependencies Overview

```json
{
  "runtime": {
    "node": ">=14.0.0",
    "mysql": ">=8.0.0"
  },
  "core": {
    "express": "^5.1.0",
    "sequelize": "^6.37.7",
    "mysql2": "^3.14.1"
  },
  "authentication": {
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^6.0.0"
  },
  "integrations": {
    "axios": "^1.9.0",
    "multer": "^1.4.5-lts.2"
  },
  "validation": {
    "joi": "^17.13.3"
  }
}
```

### API Versioning Strategy

- **Current Version**: v1 (`/api/v1/`)
- **Backward Compatibility**: Maintained for at least 6 months
- **Version Headers**: Support for `API-Version` header
- **Deprecation Notice**: 30-day advance notice for breaking changes

## 📋 Changelog

### Version 1.0.0 (Current)

**🆕 New Features:**

- Complete REST API with 50+ endpoints
- JWT-based authentication system
- Role-based authorization (User, Artist, Admin)
- Spotify Web API integration
- File upload system for audio and images
- Subscription management with quota tracking
- Advertisement system with analytics
- Real-time streaming quota management
- Comprehensive admin dashboard

**🔧 Technical Improvements:**

- Sequelize ORM with proper model associations
- Bcrypt password hashing with salt rounds
- Rate limiting with configurable tiers
- Soft delete implementation across all models
- Comprehensive input validation with Joi
- Error handling and logging system

**🐛 Bug Fixes:**

- Fixed Sequelize association alias mismatches
- Corrected foreign key mappings in models
- Resolved double quota decrementation issues
- Fixed Spotify API credential configuration
- Updated UserDownload model schema alignment

---

**Made with ❤️ by the TrashWave Team**

_Building the future of music streaming, one API endpoint at a time._
