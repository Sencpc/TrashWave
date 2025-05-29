# TrashWave Music Streaming API

A comprehensive music streaming platform backend with user authentication, role-based authorization, Spotify integration, and subscription management.

**Original Proposal**: [View Project Proposal](https://docs.google.com/document/d/1bBqV-fQcDU5Wm12X_9_NKSMbVuCtoXrvahUYLwm_zGw/edit?usp=sharing)

## 🚀 Features

- **User Management**: Registration, authentication, profile management
- **Role-Based Access**: Admin, Artist, and User roles with specific permissions
- **Music Content**: Songs, albums, playlists with CRUD operations
- **Social Features**: Follow artists, like songs/albums/playlists
- **Subscription System**: Free, Premium Lite, and Premium tiers
- **Spotify Integration**: Search and import music data from Spotify
- **Download System**: Track downloads with subscription-based quotas
- **Ad System**: Ad management and tracking for monetization
- **Analytics**: Comprehensive dashboard and reporting
- **File Upload**: Support for audio files and cover images
- **Rate Limiting**: API protection with configurable limits

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
│   ├── config/          # Configuration files
│   ├── controller/      # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── Model/          # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── validation/     # Input validation schemas
├── storage/            # File uploads (auto-created)
├── .env               # Environment variables
├── index.js           # Main application file
└── package.json       # Dependencies and scripts
```

## 🛡️ API Endpoints

### Authentication

- `POST /api/v1/account/register` - Register new user
- `POST /api/v1/account/login` - User login
- `POST /api/v1/account/logout` - User logout
- `POST /api/v1/account/refresh` - Refresh access token

### Songs

- `GET /api/v1/songs` - Get all songs
- `POST /api/v1/songs` - Upload new song (Artist/Admin)
- `GET /api/v1/songs/:id` - Get song details
- `POST /api/v1/songs/:id/like` - Like/unlike song
- `POST /api/v1/songs/:id/download` - Download song

### Artists

- `GET /api/v1/artists` - Get all artists
- `POST /api/v1/artists/register` - Register as artist
- `POST /api/v1/artists/:id/follow` - Follow/unfollow artist

### Albums & Playlists

- `GET /api/v1/albums` - Get albums
- `GET /api/v1/playlists` - Get public playlists
- `POST /api/v1/playlists` - Create playlist

### Subscriptions

- `GET /api/v1/subscriptions/plans` - Get subscription plans
- `POST /api/v1/subscriptions/subscribe` - Subscribe to plan

### Admin

- `GET /api/v1/admin/dashboard` - Admin dashboard
- `GET /api/v1/admin/analytics` - Platform analytics

## 💳 Subscription Plans

| Plan             | Price | Features                                                    |
| ---------------- | ----- | ----------------------------------------------------------- |
| **Free**         | $0    | 5 downloads/day, 3 playlists, ads, standard quality         |
| **Premium Lite** | $4.99 | 50 downloads/day, 20 playlists, ad-free, high quality       |
| **Premium**      | $9.99 | Unlimited downloads, unlimited playlists, ad-free, lossless |

## 📊 Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- File uploads: 20 requests per hour
- Search: 30 requests per minute

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 🔧 Database Commands

```bash
# Sync database (safe, preserves data)
npm run db:sync

# Force sync (WARNING: drops all tables)
npm run db:force

# Drop all tables
npm run db:drop
```

## 📝 Development

1. Use `npm run dev` for development with auto-reload
2. Check `logs/` directory for application logs
3. File uploads are stored in `storage/` directory
4. Environment variables in `.env` file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:

- Create an issue on GitHub
- Check the API documentation at `/api/v1/docs`
- Review the server logs for debugging

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Set up a reverse proxy (nginx)
4. Configure SSL certificates
5. Set up database backups
6. Monitor application performance

---

**Made with ❤️ by the TrashWave Team**
