"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserDownload extends Model {
    static associate(models) {
      UserDownload.belongsTo(models.User, { foreignKey: "user_id" });
      UserDownload.belongsTo(models.Song, { foreignKey: "song_id" });
    }
  }

  UserDownload.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      song_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "songs",
          key: "id",
        },
      },
      download_quality: {
        type: DataTypes.ENUM("standard", "high", "lossless"),
        defaultValue: "standard",
      },
      file_size: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      download_completed: {
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
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UserDownload",
      tableName: "user_downloads",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      name: {
        singular: "UserDownload",
        plural: "UserDownloads",
      },
    }
  );

  return UserDownload;
};
