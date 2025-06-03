"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserLikeAlbum extends Model {
    static associate(models) {
      UserLikeAlbum.belongsTo(models.User, { foreignKey: "user_id" });
      UserLikeAlbum.belongsTo(models.Album, { foreignKey: "album_id" });
    }
  }

  UserLikeAlbum.init(
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
      album_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "albums",
          key: "id",
        },
      },
      liked_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "UserLikeAlbum",
      tableName: "user_like_albums",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "album_id"],
        },
      ],
      name: {
        singular: "UserLikeAlbum",
        plural: "UserLikeAlbums",
      },
    }
  );

  return UserLikeAlbum;
};
