const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const rPlaylist = require("./src/routes/rPlaylist");
const rAlbum = require("./src/routes/rAlbum");
const rSong = require("./src/routes/rSong");

app.use("/api/v1/playlist", rPlaylist);
app.use("/api/v1/album", rAlbum);
app.use("/api/v1/song", rSong);

const port = 3000;
app.listen(port, () => {
  console.log(`Server Jalan di port ${port}`);
});
