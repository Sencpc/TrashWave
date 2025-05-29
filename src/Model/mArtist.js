"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Artist extends Model {
    static associate(models) {
      Artist.belongsTo(models.User, { foreignKey: "user_id" });
      Artist.hasMany(models.Album, { foreignKey: "artist_id" });
      Artist.hasMany(models.Song, { foreignKey: "artist_id" });
    }
  }

  Artist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      stage_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      bio: {
        type: DataTypes.TEXT,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      follower_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      monthly_listeners: {
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
      modelName: "Artist",
      tableName: "artists",
      timestamps: false,
      paranoid: true,
      name: {
        singular: "Artist",
        plural: "Artists",
      },
    }
  );

  return Artist;
};
