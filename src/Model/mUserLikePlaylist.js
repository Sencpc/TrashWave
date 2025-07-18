"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserLikePlaylist extends Model {
    static associate(models) {
      UserLikePlaylist.belongsTo(models.User, { foreignKey: "user_id" });
      UserLikePlaylist.belongsTo(models.Playlist, {
        foreignKey: "playlist_id",
      });
    }
  }

  UserLikePlaylist.init(
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
      playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "playlists",
          key: "id",
        },
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
    },
    {
      sequelize,
      modelName: "UserLikePlaylist",
      tableName: "user_like_playlists",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["user_id", "playlist_id"],
        },
      ],
      name: {
        singular: "UserLikePlaylist",
        plural: "UserLikePlaylists",
      },
    }
  );

  return UserLikePlaylist;
};
