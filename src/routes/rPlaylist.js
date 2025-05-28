const express = require("express");
const rPlaylist = express.Router();
const middleware = require("../Middleware/mIndex");

const {
    getAllPlaylist,
    getPlaylistById,
    createPlaylist
} = require("../controller/cPlaylist");

rPlaylist.get("/", getAllPlaylist);
rPlaylist.get("/:playlistId", getPlaylistById);
// rPlaylist.post("/", middleware.cekRoles, createPlaylist);

module.exports = rPlaylist;