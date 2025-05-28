// const verifyJWT = require("./verifyJWT");
const cekRoles = require("./cekRoles");

const middleware = {};

// middleware.verifyJWT = verifyJWT;
middleware.cekRoles = cekRoles;

module.exports = middleware;
