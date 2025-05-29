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
      NAME: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      price_monthly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      price_yearly: {
        type: DataTypes.DECIMAL(10, 2),
      },
      streaming_limit: {
        type: DataTypes.INTEGER,
      },
      download_limit: {
        type: DataTypes.INTEGER,
      },
      features: {
        type: DataTypes.JSON,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
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
      modelName: "SubscriptionPlan",
      tableName: "subscription_plans",
      timestamps: false,
      paranoid: true,
      name: {
        singular: "SubscriptionPlan",
        plural: "SubscriptionPlans",
      },
    }
  );

  return SubscriptionPlan;
};
