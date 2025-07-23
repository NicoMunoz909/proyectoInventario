"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Inventarios", "CFDI");
    await queryInterface.removeColumn("Inventarios", "isBackup");
    await queryInterface.removeColumn("Inventarios", "isDemo");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Inventarios", "CFDI", Sequelize.STRING);
    await queryInterface.addColumn(
      "Inventarios",
      "isBackup",
      Sequelize.BOOLEAN
    );
    await queryInterface.addColumn("Inventarios", "isDemo", Sequelize.BOOLEAN);
  },
};
