"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("logs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false, // berasal dari users.username
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deployment_releaseId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      support_releaseId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      support_impactedApp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      oldValue: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      newValue: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("logs");
  },
};
