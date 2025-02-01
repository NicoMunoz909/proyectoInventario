'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inventarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ordenDeCompra: {
        type: Sequelize.STRING
      },
      partNumber: {
        type: Sequelize.STRING
      },
      proveedor: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.STRING
      },
      serialNumber: {
        type: Sequelize.STRING,
      },
      facturaCompra: {
        type: Sequelize.STRING
      },
      cfdi: {
        type: Sequelize.STRING
      },
      almacen: {
        type: Sequelize.STRING
      },
      sector: {
        type: Sequelize.STRING
      },
      facturaVenta: {
        type: Sequelize.STRING
      },
      destino: {
        type: Sequelize.STRING
      },
      fechaEntrada: {
        type: Sequelize.DATE
      },
      fechaSalida: {
        type: Sequelize.DATE
      },
      isBackup: {
        type: Sequelize.BOOLEAN
      },
      isDemo: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Inventarios');
  }
};