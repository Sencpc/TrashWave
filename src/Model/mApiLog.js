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
      endpoints: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING(45),
      },
      user_agent: {
        type: DataTypes.TEXT,
      },
      response_status: {
        type: DataTypes.INTEGER,
      },
      response_time_ms: {
        type: DataTypes.INTEGER,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "ApiLog",
      tableName: "api_log",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      name: {
        singular: "ApiLog",
        plural: "ApiLogs",
      },
    }
  );

  return ApiLog;
};
