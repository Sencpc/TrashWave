const express = require('express');

const app = express.Router();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const mainRouter = require("./src/route/routerIndex");

app.use('/api/v1' , mainRouter);

const port = 3000
app.listen(port , ()=>{
    console.log(`Server Jalan di port ${port}`);
});