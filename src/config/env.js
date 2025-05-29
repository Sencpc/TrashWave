const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Environment validation
const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET",
];

const optionalEnvVars = {
  NODE_ENV: "development",
  PORT: "3000",
  DB_PORT: "3306",
  JWT_EXPIRES_IN: "24h",
  REFRESH_TOKEN_EXPIRES_IN: "7d",
  SPOTIFY_CLIENT_ID: "",
  SPOTIFY_CLIENT_SECRET: "",
  API_RATE_LIMIT_WINDOW: "15",
  API_RATE_LIMIT_MAX: "100",
};

// Validate required environment variables (allow empty password for development)
const missingVars = requiredEnvVars.filter((varName) => {
  if (varName === "DB_PASSWORD") {
    return process.env[varName] === undefined; // Allow empty password but not undefined
  }
  return !process.env[varName];
});

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error(
    "\nPlease check your .env file and ensure all required variables are set."
  );
  process.exit(1);
}

// Set default values for optional variables
Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
  if (!process.env[key]) {
    process.env[key] = defaultValue;
  }
});

// Export configuration object
const config = {
  app: {
    name: "TrashWave",
    version: "1.0.0",
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT),
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    enabled: !!(
      process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET
    ),
  },
  rateLimiting: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW) * 60 * 1000,
    max: parseInt(process.env.API_RATE_LIMIT_MAX),
  },
  upload: {
    maxFileSize: {
      audio: 50 * 1024 * 1024, // 50MB
      image: 5 * 1024 * 1024, // 5MB
      video: 100 * 1024 * 1024, // 100MB
    },
    allowedTypes: {
      audio: ["mp3", "wav", "flac", "m4a"],
      image: ["jpeg", "jpg", "png"],
      video: ["mp4", "avi", "mov"],
    },
  },
};

// Validate configuration
console.log(
  `🔧 Configuration loaded for ${config.app.name} v${config.app.version}`
);
console.log(`📊 Environment: ${config.app.env}`);
console.log(
  `🐬 Database: ${config.database.host}:${config.database.port}/${config.database.name}`
);
console.log(
  `🎵 Spotify integration: ${config.spotify.enabled ? "Enabled" : "Disabled"}`
);

module.exports = config;
