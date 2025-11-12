"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("knowledge_centers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // 🔹 Problem / Error yang sering terjadi
      problem: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      // 🔹 Solusi dari problem tersebut
      solution: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      // 🔹 User pembuat entry (developer / SQI)
      createdByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("knowledge_centers");
  },
};
