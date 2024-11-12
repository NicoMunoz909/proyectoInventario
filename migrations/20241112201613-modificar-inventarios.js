"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Inventarios", "descripcion");

    await queryInterface.changeColumn("Inventarios", "partNumber", {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "PartNumbers",
        key: "partNumber",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
