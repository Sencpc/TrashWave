"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentTransaction extends Model {
    static associate(models) {
      PaymentTransaction.belongsTo(models.User, { foreignKey: "user_id" });
      PaymentTransaction.belongsTo(models.SubscriptionPlan, {
        foreignKey: "subscription_plan_id",
      });
    }
  }

  PaymentTransaction.init(
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
      subscription_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "subscription_plans",
          key: "id",
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        defaultValue: "IDR",
      },
      payment_method: {
        type: DataTypes.STRING(50),
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        unique: true,
      },
      STATUS: {
        type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
        defaultValue: "pending",
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
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
      modelName: "PaymentTransaction",
      tableName: "payment_transactions",
      timestamps: false,
      paranoid: true,
      name: {
        singular: "PaymentTransaction",
        plural: "PaymentTransactions",
      },
    }
  );

  return PaymentTransaction;
};
