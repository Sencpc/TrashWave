const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AdView extends Model {
    static associate(models) {
      // AdView belongs to an Ad
      AdView.belongsTo(models.Ad, {
        foreignKey: "ad_id",
        as: "ad",
      });

      // AdView belongs to a User
      AdView.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  AdView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ads",
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      view_type: {
        type: DataTypes.ENUM("impression", "click", "complete_view"),
        allowNull: false,
        defaultValue: "impression",
      },
      view_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Duration watched in seconds",
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      referrer: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      device_info: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      location_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "AdView",
      tableName: "AdViews",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return AdView;
};
