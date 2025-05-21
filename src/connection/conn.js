const { Sequelize } = require("sequelize");

const {
    database,
    username,
    password,
    host,
    dialect,
    port,
  } = require("../config/db");

const sequelize = new Sequelize(database , username , password , {
    host: host,
    dialect: dialect,
    port: port
});

console.log(`Connecting to Dataabase ${database}`);

if(sequelize){
    console.log(`Database Connected. Database : ${database} , diport : ${port} ,host : ${host}`);
}
else{
    console.log(`Gagal Terhubung ke database!`);
}


module.exports = sequelize;