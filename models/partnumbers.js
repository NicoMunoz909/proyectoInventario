"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class partNumbers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      partNumbers.hasMany(models.Inventario, { foreignKey: "partNumber" });
    }
  }
  partNumbers.init(
    {
      partNumber: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "partNumbers",
    }
  );
  return partNumbers;
};
