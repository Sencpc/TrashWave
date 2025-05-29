const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { Sequelize } = require("sequelize");

const storageSingle = multer.diskStorage({
    destination: (req, file, callback)=>{
        const folderName = `uploads/${req.body.pengguna_nama}`;
        if(!fs.existsSync(folderName)){
            fs.mkdirSync(folderName, {recursive: true});
        }
        callback(null, folderName);
    },
    filename: (req, file, callback)=>{
            const fileExt = path.extname(file.originalname);
            if(file.fieldname == "pengguna_pp"){
                callback(null, `profpic${fileExt}`);
            } else if(file.fieldname == "pengguna_file[]") {
                callback(null, `${id}${fileExt}`);
                id++;
            } else{
                callback(null, false);
            }
            // callback(null, file.fieldname);
    },
});

const upload = multer({
    storage: storageSingle,
    limits: {
        fileSize: 5*1024*1024,
    },
    fileFilter:(req, file, callback)=>{
        const filetype = /jpeg|png|jpg/;
        const fileExtension = path.extname(file.originalname).toLowerCase();

        const checkExtname = filetype.test(fileExtension);
        const checkMimetype = filetype.test(file.mimetype);

        if(checkMimetype && checkExtname){
            callback(null,true);
        } else {
            callback(null, false);
            return callback(
                new multer.MulterError(
                    "File type not supported",
                    file.fieldname,
                )
            );
        }
    },
});
