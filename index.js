const express = require('express');

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// const mainRouter = require("./src/routes/routerIndex");
const rPlaylist = require("./src/routes/rPlaylist");

// app.use('/api/v1' , mainRouter);
app.use('/api/v1/playlist' , rPlaylist);

const port = 3000
app.listen(port , ()=>{
    console.log(`Server Jalan di port ${port}`);
});