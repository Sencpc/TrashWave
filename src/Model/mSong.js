"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      Song.belongsTo(models.Artist, {
        foreignKey: "artist_id",
        as: "artist",
      });
      Song.belongsTo(models.Album, {
        foreignKey: "album_id",
        as: "album",
      });
      Song.hasMany(models.PlaylistSong, { foreignKey: "song_id" });
      Song.belongsToMany(models.Playlist, {
        through: models.PlaylistSong,
        foreignKey: "song_id",
      });
      // Many-to-many relationship with Albums through AlbumSong
      Song.belongsToMany(models.Album, {
        through: models.AlbumSong,
        foreignKey: "song_id",
        otherKey: "album_id",
        as: "albumsViaJunction",
      });
      Song.hasMany(models.AlbumSong, {
        foreignKey: "song_id",
        as: "albumSongEntries",
      });
    }
  }

  Song.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      artist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "artists",
          key: "id",
        },
      },
      album_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "albums",
          key: "id",
        },
      },
      file_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lyrics: {
        type: DataTypes.TEXT,
      },
      play_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      like_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      release_date: {
        type: DataTypes.DATEONLY,
      },
      is_explicit: {
        type: DataTypes.BOOLEAN,
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
      modelName: "Song",
      tableName: "songs",
      timestamps: false,
      paranoid: true,
      name: {
        singular: "Song",
        plural: "Songs",
      },
    }
  );

  return Song;
};
