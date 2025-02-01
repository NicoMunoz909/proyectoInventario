"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            isEmail: true
        },
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        validate: {
            is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/i
        },
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: "User",
      timestamps: false,
    }
  );
  return User;
};