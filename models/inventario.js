"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Inventario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Inventario.belongsTo(models.partNumbers, { foreignKey: "partNumber", as: "partNumberID" });
    }
  }
  Inventario.init(
    {
      ordenDeCompra: DataTypes.STRING,
      partNumber: DataTypes.STRING,
      proveedor: DataTypes.STRING,
      serialNumber: DataTypes.STRING,
      facturaCompra: DataTypes.STRING,
      cfdi: DataTypes.STRING,
      almacen: DataTypes.STRING,
      sector: DataTypes.STRING,
      facturaVenta: DataTypes.STRING,
      destino: DataTypes.STRING,
      fechaEntrada: DataTypes.DATE,
      fechaSalida: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Inventario",
    }
  );
  return Inventario;
};
