"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Album extends Model {
    static associate(models) {
      Album.belongsTo(models.Artist, { foreignKey: "id" });
      Album.hasMany(models.Song, { foreignKey: "id" });
    }
  }

  Album.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(200),
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
      cover_image: {
        type: DataTypes.STRING(255),
      },
      release_date: {
        type: DataTypes.DATEONLY,
      },
      description: {
        type: DataTypes.TEXT,
      },
      genre:{
        type:DataTypes.STRING(100)
      },
      total_tracks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_single: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      is_explicit:{
        type:DataTypes.BOOLEAN,
        defaultValue: 0
      },
      play_count:{
        type:DataTypes.INTEGER,
        defaultValue: 0
      },
      like_count:{
        type:DataTypes.INTEGER,
        defaultValue: 0
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
      modelName: "Album",
      tableName: "albums",
      timestamps: false,
      paranoid: true,
      name: {
        singular: "Album",
        plural: "Albums",
      },
    }
  );

  return Album;
};
