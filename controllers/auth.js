require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { Op } = require("sequelize");
const { RESPONSE_STATUS } = require("../config/constants.js");

const register = async (req, res) => {

  const hashedPassword = bcrypt.hashSync(req.body.password, 10)


  try {
    const newUser = await User.create({...req.body, password: hashedPassword})
    res.status(201).json({status: RESPONSE_STATUS.OK, message: "Usuario creado", data: newUser})
  } catch (error) {
    res.status(400).json({status: RESPONSE_STATUS.SERVER_ERROR, message: "No se pudo crear el usuario", data: error})
  }
}

const login = async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: {
        username: req.body.username
      }
    })
    if (!user) return res.status(400).json({status: RESPONSE_STATUS.NO_MATCH, message: "Credenciales Incorrectas", data:null});

    const checkPassword = bcrypt.compareSync(req.body.password, user.password)
    if (!checkPassword) return res.status(400).json({status: RESPONSE_STATUS.NO_MATCH, message: "Credenciales Incorrectas", data:null})
    
    const accessToken = jwt.sign(user.dataValues, process.env.PRIVATE_KEY, {expiresIn: "1d"});
    const refreshToken = jwt.sign(user.dataValues, process.env.REFRESH_KEY, {expiresIn: "7d"});

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "None",
      path: "/", // Limits where the cookie is sent
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms (D * H * M * S * MS)
      domain: null
    });

    res.status(200).json({status: RESPONSE_STATUS.OK, message: "Login Exitoso", data: accessToken})

  } catch (error) {
    console.log(error)
    res.status(400).json({status: RESPONSE_STATUS.SERVER_ERROR, message: "Error en Login", data: error})
  }
}

const logout = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });

    res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};

module.exports = {register, login, logout }