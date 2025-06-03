const { sequelize } = require("../config/db");
const models = require("../Model/mIndex");

const syncDatabase = async (force = false) => {
  try {
    console.log("🔄 Starting database synchronization...");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");    // Sync all models
    if (force) {
      console.log("⚠️  Force sync enabled - This will drop existing tables!");
      await sequelize.sync({ force: true });
      console.log("✅ Database force synced successfully.");
    } else {
      // Use force: true temporarily to fix column name mismatch
      console.log("⚠️  Using force sync to fix schema mismatch - This will drop existing tables!");
      await sequelize.sync({ force: true });
      console.log("✅ Database synced successfully.");
    }

    // Create default data if needed
    await createDefaultData();

    console.log("🎉 Database initialization completed!");
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
    throw error;
  }
};

const createDefaultData = async () => {
  try {
    const { SubscriptionPlan } = models;

    // Check if subscription plans exist
    const planCount = await SubscriptionPlan.count();

    if (planCount === 0) {
      console.log("📋 Creating default subscription plans...");

      await SubscriptionPlan.bulkCreate([
        {
          name: "Free",
          description: "Basic access with ads",
          price: 0.0,
          features: JSON.stringify({
            max_downloads_per_day: 5,
            max_playlists: 3,
            ads_enabled: true,
            audio_quality: "standard",
            offline_mode: false,
          }),
          max_downloads_per_day: 5,
          max_playlists: 3,
          ads_enabled: true,
        },
        {
          name: "Premium Lite",
          description: "Ad-free music with limited downloads",
          price: 4.99,
          features: JSON.stringify({
            max_downloads_per_day: 50,
            max_playlists: 20,
            ads_enabled: false,
            audio_quality: "high",
            offline_mode: true,
          }),
          max_downloads_per_day: 50,
          max_playlists: 20,
          ads_enabled: false,
        },
        {
          name: "Premium",
          description: "Full access with unlimited downloads",
          price: 9.99,
          features: JSON.stringify({
            max_downloads_per_day: -1, // unlimited
            max_playlists: -1, // unlimited
            ads_enabled: false,
            audio_quality: "lossless",
            offline_mode: true,
          }),
          max_downloads_per_day: -1,
          max_playlists: -1,
          ads_enabled: false,
        },
      ]);

      console.log("✅ Default subscription plans created.");
    }
  } catch (error) {
    console.error("❌ Error creating default data:", error);
  }
};

const dropDatabase = async () => {
  try {
    console.log("🗑️  Dropping all tables...");
    await sequelize.drop();
    console.log("✅ All tables dropped successfully.");
  } catch (error) {
    console.error("❌ Error dropping tables:", error);
    throw error;
  }
};

module.exports = {
  syncDatabase,
  createDefaultData,
  dropDatabase,
};
