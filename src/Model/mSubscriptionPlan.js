"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubscriptionPlan extends Model {
    static associate(models) {
      SubscriptionPlan.hasMany(models.PaymentTransaction, {
        foreignKey: "subscription_plan_id",
      });
    }
  }

  SubscriptionPlan.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      price_monthly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      price_yearly: {
        type: DataTypes.DECIMAL(10, 2),
      },
      streaming_limit: {
        type: DataTypes.INTEGER,
        defaultValue: -1,
      },
      download_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      features: {
        type: DataTypes.JSON,
      },
      trial_period_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
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
      modelName: "SubscriptionPlan",
      tableName: "subscription_plans",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      name: {
        singular: "SubscriptionPlan",
        plural: "SubscriptionPlans",
      },
    }
  );

  return SubscriptionPlan;
};
