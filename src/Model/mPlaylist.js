"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(models.User, { foreignKey: "user_id" });
      Playlist.hasMany(models.PlaylistSong, { foreignKey: "playlist_id" });
      Playlist.belongsToMany(models.Song, {
        through: models.PlaylistSong,
        foreignKey: "playlist_id",
      });
    }
  }

  Playlist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      cover_image: {
        type: DataTypes.STRING(255),
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_official: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      like_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_songs: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      total_duration: {
        type: DataTypes.INTEGER,
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
      modelName: "Playlist",
      tableName: "playlists",
      timestamps: false,
      paranoid: true,
      name: {
        singular: "Playlist",
        plural: "Playlists",
      },
    }
  );

  return Playlist;
};
