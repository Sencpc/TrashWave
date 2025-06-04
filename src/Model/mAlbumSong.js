"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AlbumSong extends Model {
    static associate(models) {
      AlbumSong.belongsTo(models.Album, { foreignKey: "album_id" });
      AlbumSong.belongsTo(models.Song, { foreignKey: "song_id" });
    }
  }

  AlbumSong.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      album_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "albums",
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
      track_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      added_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      modelName: "AlbumSong",
      tableName: "album_songs",
      timestamps: false,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["album_id", "song_id"],
        },
        {
          unique: true,
          fields: ["album_id", "track_number"],
        },
      ],
      name: {
        singular: "AlbumSong",
        plural: "AlbumSongs",
      },
    }
  );

  return AlbumSong;
};
