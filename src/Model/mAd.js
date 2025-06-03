const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Ad extends Model {
    static associate(models) {
      // Ad belongs to a User (advertiser)
      Ad.belongsTo(models.User, {
        foreignKey: "advertiser_id",
        as: "advertiser",
      });

      // Ad has many AdViews
      Ad.hasMany(models.AdView, {
        foreignKey: "ad_id",
        as: "views",
      });
    }
  }

  Ad.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      advertiser_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      video_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      audio_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      total_getSQ: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      target_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total_views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_clicks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: "Ad",
      tableName: "ads",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Ad;
};
