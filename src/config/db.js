require("dotenv").config();
module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: DB_DRIVER,
  port: process.env.DB_PORT,
};
