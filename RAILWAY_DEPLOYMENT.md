# Railway Deployment Guide for TrashWave API

## Fixed Issues for Railway Deployment

### 1. **Node.js Version Compatibility**

- ✅ Removed restrictive Node.js version requirement (`<17.0.0`)
- ✅ Now supports Node.js 16+ (Railway compatible)

### 2. **Port Configuration**

- ✅ Added proper PORT environment variable handling
- ✅ Server now binds to `0.0.0.0` (required for Railway)
- ✅ Fallback port configuration: `process.env.PORT || 3000`

### 3. **Health Check Endpoints**

- ✅ Enhanced `/health` endpoint with more information
- ✅ Added root `/` endpoint for Railway health checks
- ✅ Both endpoints return proper HTTP 200 status codes

### 4. **Database Connection**

- ✅ Added SSL support for production databases
- ✅ Connection retry logic for better reliability
- ✅ Graceful error handling for database connection issues

### 5. **Process Management**

- ✅ Added graceful shutdown handling (SIGTERM)
- ✅ Proper error handling for server startup
- ✅ Added server error event handlers

## Deployment Steps

### 1. **Railway Setup**

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your TrashWave repository

### 2. **Environment Variables**

Set these environment variables in Railway dashboard:

```bash
# Database Configuration
DB_HOST=sql.freedb.tech
DB_PORT=3306
DB_USER=freedb_adminTrashwave
DB_PASSWORD=?AHkVQ74!Q*p7MN
DB_NAME=freedb_db_trashwave

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production

# Spotify API (Optional)
SPOTIFY_CLIENT_ID=6cce87f44dd04ad7b8f29a036567b310
SPOTIFY_CLIENT_SECRET=6ca752a1d9d144ee9fb8b6734522a99d

# Rate Limiting
API_RATE_LIMIT_WINDOW=15
API_RATE_LIMIT_MAX=100
```

### 3. **Important Security Notes**

⚠️ **CHANGE THESE IN PRODUCTION:**

- `JWT_SECRET`: Use a strong, random secret (minimum 32 characters)
- `REFRESH_TOKEN_SECRET`: Use a different strong, random secret
- Consider using Railway's built-in secret generation

### 4. **Railway Configuration Files**

The following files have been created/updated for Railway:

- ✅ `Procfile` - Tells Railway how to start your app
- ✅ `railway.json` - Railway-specific configuration
- ✅ `package.json` - Updated with proper Node.js version requirements

### 5. **Database Connection**

Your current database setup should work with Railway. The app will:

- ✅ Test database connection on startup
- ✅ Continue running even if database is temporarily unavailable
- ✅ Use SSL in production mode for secure connections

## Monitoring & Debugging

### Health Check URLs

Once deployed, test these endpoints:

- `https://your-app.railway.app/` - Root health check
- `https://your-app.railway.app/health` - Detailed health check
- `https://your-app.railway.app/api/v1/docs` - API documentation

### Common Issues & Solutions

1. **"Application failed to respond"**

   - ✅ Fixed: Server now binds to `0.0.0.0` instead of `localhost`
   - ✅ Fixed: Proper PORT environment variable handling

2. **Database connection errors**

   - ✅ Fixed: Added SSL support for production
   - ✅ Fixed: Connection retry logic
   - Check that all database environment variables are set correctly

3. **Build failures**

   - ✅ Fixed: Updated Node.js version requirements
   - Ensure all dependencies are in `package.json`

4. **Memory/Performance issues**
   - Railway has automatic scaling
   - Monitor logs in Railway dashboard

### Deployment Commands

```bash
# Railway CLI (optional)
npm install -g @railway/cli
railway login
railway link
railway up
```

## Testing Deployment

After deployment, test these key endpoints:

```bash
# Health check
curl https://your-app.railway.app/health

# API documentation
curl https://your-app.railway.app/api/v1/docs

# Account registration (test API functionality)
curl -X POST https://your-app.railway.app/api/v1/account/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Next Steps

1. **Deploy to Railway** using the steps above
2. **Test all endpoints** to ensure everything works
3. **Set up custom domain** (optional) in Railway dashboard
4. **Monitor logs** for any issues
5. **Update DNS/domain settings** if needed

Your TrashWave API should now deploy successfully on Railway! 🚀
