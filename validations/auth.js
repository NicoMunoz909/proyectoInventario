require("dotenv").config();
const jwt = require("jsonwebtoken");
const { RESPONSE_STATUS } = require("../config/constants.js")

const validateToken = (req, res, next) => {
  try {
    if (!req.headers.authorization) return res.status(403).json({stats: RESPONSE_STATUS.CREDENTIALS_ERROR, message: "No se encontraron credenciales", data:null})
  
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(403).json({stats: RESPONSE_STATUS.CREDENTIALS_ERROR, message: "No se encontraron credenciales", data:null})
      
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    if (decoded) {
      next();
    } else {
      return res.send("Wrong credentials");
    }
  } catch (error) {
    if (error.name = "JsonWebTokenError") return res.status(403).json({status: RESPONSE_STATUS.CREDENTIALS_ERROR, message: "Token incorrecto o expirado", data:error})
    res.status(500).json({status: RESPONSE_STATUS.SERVER_ERROR, message: "Internal Server Error", data:error})
  }
}

module.exports = { validateToken }