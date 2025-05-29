"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ApiTierlist extends Model {
    static associate(models) {}
  }

  ApiTierlist.init(
    {
      api_tier: {
        type: DataTypes.ENUM("free", "freemium", "premium"),
        allowNull: false,
        primaryKey: true,
      },
      api_limit: {
        type: DataTypes.INTEGER,
      },
      api_quota: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "ApiTierlist",
      tableName: "api_tierlist",
      timestamps: false,
      name: {
        singular: "ApiTierlist",
        plural: "ApiTierlists",
      },
    }
  );

  return ApiTierlist;
};
