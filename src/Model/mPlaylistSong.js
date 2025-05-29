"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PlaylistSong extends Model {
    static associate(models) {
      PlaylistSong.belongsTo(models.Playlist, { foreignKey: "playlist_id" });
      PlaylistSong.belongsTo(models.Song, { foreignKey: "song_id" });
    }
  }

  PlaylistSong.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "playlists",
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
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      added_at: {
        type: DataTypes.DATE,
        allowNull: false,
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
      modelName: "PlaylistSong",
      tableName: "playlist_songs",
      timestamps: false,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["playlist_id", "song_id"],
        },
      ],
      name: {
        singular: "PlaylistSong",
        plural: "PlaylistSongs",
      },
    }
  );

  return PlaylistSong;
};
