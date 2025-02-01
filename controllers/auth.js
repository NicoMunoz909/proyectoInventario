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
    
    const token = jwt.sign(user.dataValues, process.env.PRIVATE_KEY)

    res.status(200).json({status: RESPONSE_STATUS.OK, message: "Login Exitoso", data:token})

  } catch (error) {
    res.status(400).json({status: RESPONSE_STATUS.SERVER_ERROR, message: "Error en Login", data: error})
  }
}

module.exports = {register, login}