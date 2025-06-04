"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserFollowArtist extends Model {
    static associate(models) {
      UserFollowArtist.belongsTo(models.User, { foreignKey: "id" });
      UserFollowArtist.belongsTo(models.Artist, { foreignKey: "id" });
    }
  }

  UserFollowArtist.init(
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
      artist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "artists",
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
      modelName: "UserFollowArtist",
      tableName: "user_follow_artists",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["user_id", "artist_id"],
        },
      ],
      name: {
        singular: "UserFollowArtist",
        plural: "UserFollowArtists",
      },
    }
  );

  return UserFollowArtist;
};
