const { DataTypes } = require('sequelize');
const sequelize = require('../connection/conn');

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cover_image: {
    type: DataTypes.STRING(255)
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_official: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_songs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deleted_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'playlists',
  timestamps: false
});

module.exports = Playlist;
