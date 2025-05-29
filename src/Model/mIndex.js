//Gabungkan semua model yang ada.
const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const db = {};

// Initialize models using factory pattern
const User = require("./mAccount")(sequelize, DataTypes);
const ApiTierlist = require("./mApiTierlist")(sequelize, DataTypes);
const ApiLog = require("./mApiLog")(sequelize, DataTypes);
const Artist = require("./mArtist")(sequelize, DataTypes);
const Album = require("./mAlbum")(sequelize, DataTypes);
const Song = require("./mSong")(sequelize, DataTypes);
const Playlist = require("./mPlaylist")(sequelize, DataTypes);
const PlaylistSong = require("./mPlaylistSong")(sequelize, DataTypes);
const SubscriptionPlan = require("./mSubscriptionPlan")(sequelize, DataTypes);
const PaymentTransaction = require("./mPaymentTransaction")(
  sequelize,
  DataTypes
);
const UserFollowArtist = require("./mUserFollowArtist")(sequelize, DataTypes);
const UserLikeSong = require("./mUserLikeSong")(sequelize, DataTypes);
const UserLikePlaylist = require("./mUserLikePlaylist")(sequelize, DataTypes);
const UserLikeAlbum = require("./mUserLikeAlbum")(sequelize, DataTypes);
const UserDownload = require("./mUserDownload")(sequelize, DataTypes);

// Initialize new models that also use factory pattern
const Ad = require("./mAd")(sequelize, DataTypes);
const AdView = require("./mAdView")(sequelize, DataTypes);

//daftarkan semua model
db.User = User;
db.ApiTierlist = ApiTierlist;
db.ApiLog = ApiLog;
db.Artist = Artist;
db.Album = Album;
db.Song = Song;
db.Playlist = Playlist;
db.PlaylistSong = PlaylistSong;
db.SubscriptionPlan = SubscriptionPlan;
db.PaymentTransaction = PaymentTransaction;
db.UserFollowArtist = UserFollowArtist;
db.UserLikeSong = UserLikeSong;
db.UserLikePlaylist = UserLikePlaylist;
db.UserLikeAlbum = UserLikeAlbum;
db.UserDownload = UserDownload;
db.Ad = Ad;
db.AdView = AdView;

// Add sequelize instance to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//untuk hubungkan ke associate
for (const key of Object.keys(db)) {
  if (db[key].associate) {
    db[key].associate(db);
  }
}

module.exports = db;
