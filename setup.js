const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 TrashWave Setup Script");
console.log("==========================\n");

// Check if .env exists
const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, ".env.example");

if (!fs.existsSync(envPath)) {
  console.log("📝 Creating .env file from template...");
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log(
      "✅ .env file created. Please update it with your configuration."
    );
  } else {
    console.log("❌ .env.example not found. Please create .env manually.");
  }
} else {
  console.log("✅ .env file already exists.");
}

// Create storage directories
const storageDirectories = [
  "storage",
  "storage/songs",
  "storage/songs/audio",
  "storage/songs/covers",
  "storage/albums",
  "storage/playlists",
  "storage/artists",
  "storage/users",
  "storage/ads",
  "storage/ads/image",
  "storage/ads/video",
  "storage/ads/audio",
  "logs",
];

console.log("\n📁 Creating storage directories...");
storageDirectories.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created: ${dir}/`);
  } else {
    console.log(`✅ Exists: ${dir}/`);
  }
});

// Create .gitignore if it doesn't exist
const gitignorePath = path.join(__dirname, ".gitignore");
if (!fs.existsSync(gitignorePath)) {
  console.log("\n📝 Creating .gitignore file...");
  const gitignoreContent = `# Dependencies
node_modules/

# Environment variables
.env

# Logs
logs/
*.log

# Storage (uploaded files)
storage/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Runtime
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
dist/
build/

# Temporary files
tmp/
temp/
`;
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log("✅ .gitignore file created.");
} else {
  console.log("✅ .gitignore file already exists.");
}

console.log("\n🎉 Setup completed successfully!");
console.log("\nNext steps:");
console.log("1. Update your .env file with your database credentials");
console.log("2. Create your MySQL database: CREATE DATABASE trashwave_db;");
console.log("3. Run: npm run db:sync");
console.log("4. Start the server: npm run dev");
console.log("\n📖 Documentation: http://localhost:3000/api/v1/docs");
