//Gabungkan semua model yang ada.
const db = {};
const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const User = require("./mAccount");
const ApiTierlist = require("./mApiTierlist");
const ApiLog = require("./mApiLog");
const Artist = require("./mArtist");
const Album = require("./mAlbum");
const Song = require("./mSong");
const Playlist = require("./mPlaylist");
const PlaylistSong = require("./mPlaylistSong");
const SubscriptionPlan = require("./mSubscriptionPlan");
const PaymentTransaction = require("./mPaymentTransaction");

//daftarkan semua model dengan cara "NEW" model
db.User = User(sequelize, DataTypes);
db.ApiTierlist = ApiTierlist(sequelize, DataTypes);
db.ApiLog = ApiLog(sequelize, DataTypes);
db.Artist = Artist(sequelize, DataTypes);
db.Album = Album(sequelize, DataTypes);
db.Song = Song(sequelize, DataTypes);
db.Playlist = Playlist(sequelize, DataTypes);
db.PlaylistSong = PlaylistSong(sequelize, DataTypes);
db.SubscriptionPlan = SubscriptionPlan(sequelize, DataTypes);
db.PaymentTransaction = PaymentTransaction(sequelize, DataTypes);

//untuk hubungkan ke associate
for (const key of Object.keys(db)) {
  if (db[key].associate) {
    db[key].associate(db);
  }
}

module.exports = db;
