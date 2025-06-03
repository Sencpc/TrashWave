"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ApiTierlist extends Model {
    static associate(models) {}
  }
  ApiTierlist.init(
    {
      api_tier: {
        type: DataTypes.ENUM("free", "premium_lite", "premium"),
        allowNull: false,
        primaryKey: true,
      },
      api_limit: {
        type: DataTypes.INTEGER,
      },
      api_quota: {
        type: DataTypes.INTEGER,
      },
      features: {
        type: DataTypes.JSON,
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
      modelName: "ApiTierlist",
      tableName: "api_tierlist",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      name: {
        singular: "ApiTierlist",
        plural: "ApiTierlists",
      },
    }
  );

  return ApiTierlist;
};
