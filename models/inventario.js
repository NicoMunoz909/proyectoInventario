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
    }
  }
  Inventario.init(
    {
      ordenDeCompra: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      partNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      proveedor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false
      },
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      facturaCompra: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cfdi: DataTypes.STRING,
      almacen: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sector: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      facturaVenta: DataTypes.STRING,
      destino: DataTypes.STRING,
      isBackup: DataTypes.BOOLEAN,
      isDemo: DataTypes.BOOLEAN,
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
