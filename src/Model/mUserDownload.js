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
      download_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UserDownload",
      tableName: "user_downloads",
      timestamps: false,
      name: {
        singular: "UserDownload",
        plural: "UserDownloads",
      },
    }
  );

  return UserDownload;
};
