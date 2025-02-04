require("dotenv").config();
const jwt = require("jsonwebtoken");
const { RESPONSE_STATUS } = require("../config/constants.js")

const validateToken = (req, res, next) => {
  try {
    if (!req.headers.authorization) return res.status(403).json({stats: RESPONSE_STATUS.CREDENTIALS_ERROR, message: "No se encontraron credenciales", data:null})
  
    const accessToken = req.headers.authorization.split(' ')[1];
    if (!accessToken) return res.status(403).json({stats: RESPONSE_STATUS.CREDENTIALS_ERROR, message: "No se encontraron credenciales", data:null})
      
    const decoded = jwt.verify(accessToken, process.env.PRIVATE_KEY);
    if (decoded) {
      next();
    } else {
      return res.send("Wrong credentials");
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") return refreshToken(req, res, next);
    console.log(error);
    if (error.name === "JsonWebTokenError") return res.status(403).json({status: RESPONSE_STATUS.CREDENTIALS_ERROR, message: "Token inválido", data:error})
    res.status(500).json({status: RESPONSE_STATUS.SERVER_ERROR, message: "Internal Server Error", data:error})
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Get from cookie
    if (!refreshToken) return res.status(401).json({status: RESPONSE_STATUS.CREDENTIALS_ERROR, message: "No refresh token provided" });

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY)

    if(decoded) {
      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          id: decoded.id,
          username: decoded.username,
          password: decoded.password,
          name: decoded.name, 
          surname: decoded.surname
        },
        process.env.PRIVATE_KEY,
        { expiresIn: "10s" }
      );

      res.setHeader('Acess-Control-Allow-Headers', 'Authorization');
      res.setHeader("Authorization", `Bearer ${newAccessToken}`);
      next();
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).json({status: RESPONSE_STATUS.SERVER_ERROR, message: "Error refreshing token", data: error });
  }
};

module.exports = { validateToken }