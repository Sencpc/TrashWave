"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.ApiLog, { foreignKey: "user_id" });
      User.hasOne(models.Artist, { foreignKey: "user_id" });
      User.hasMany(models.Playlist, { foreignKey: "user_id" });
      User.hasMany(models.PaymentTransaction, { foreignKey: "user_id" });
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
      ROLE: {
        type: DataTypes.ENUM("admin", "artist", "user"),
        defaultValue: "user",
      },
      streaming_quota: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      download_quota: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
        type: DataTypes.ENUM("free", "freemium", "premium"),
        allowNull: false,
        defaultValue: "free",
      },
      api_quota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: false,
      paranoid: true,
      name: {
        singular: "User",
        plural: "Users",
      },
    }
  );

  return User;
};
