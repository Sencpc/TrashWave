"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ApiLog extends Model {
    static associate(models) {
      ApiLog.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }

  ApiLog.init(
    {
      api_log_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "ApiLog",
      tableName: "api_log",
      timestamps: true,
      paranoid: true,
      name: {
        singular: "ApiLog",
        plural: "ApiLogs",
      },
    }
  );

  return ApiLog;
};
