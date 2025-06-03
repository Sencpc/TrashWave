"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.ApiLog, { foreignKey: "user_id" });
      User.hasOne(models.Artist, { foreignKey: "user_id" });
      User.hasMany(models.Playlist, { foreignKey: "user_id" });
      User.hasMany(models.PaymentTransaction, { foreignKey: "user_id" });
      User.hasMany(models.UserFollowArtist, { foreignKey: "user_id" });
      User.hasMany(models.UserLikeSong, { foreignKey: "user_id" });
      User.hasMany(models.UserLikePlaylist, { foreignKey: "user_id" });
      User.hasMany(models.UserLikeAlbum, { foreignKey: "user_id" });
      User.hasMany(models.UserDownload, { foreignKey: "user_id" });
      User.hasMany(models.Ad, { foreignKey: "advertiser_id", as: "ads" });
      User.hasMany(models.AdView, { foreignKey: "user_id" });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      profile_picture: {
        type: DataTypes.STRING(255),
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
      },
      country: {
        type: DataTypes.STRING(50),
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      bio: {
        type: DataTypes.TEXT,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
      },
      ROLE: {
        type: DataTypes.ENUM("admin", "artist", "user"),
        defaultValue: "user",
      },
      streaming_quota: {
        type: DataTypes.INTEGER,
        defaultValue: 1000,
      },
      download_quota: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      subscription_plan_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "subscription_plans",
          key: "id",
        },
      },
      subscription_expires_at: {
        type: DataTypes.DATE,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      api_key: {
        type: DataTypes.TEXT,
      },
      refresh_token: {
        type: DataTypes.TEXT,
      },
      api_level: {
        type: DataTypes.ENUM("free", "premium_lite", "premium"),
        allowNull: false,
        defaultValue: "free",
      },
      api_quota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      last_login: {
        type: DataTypes.DATE,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      name: {
        singular: "User",
        plural: "Users",
      },
    }
  );

  return User;
};
