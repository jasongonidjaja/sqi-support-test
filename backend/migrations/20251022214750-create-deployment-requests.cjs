"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("deployment_requests", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      releaseId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      implementDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "applications",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      riskImpact: {
        type: Sequelize.ENUM("Low", "Medium", "High"),
        allowNull: false,
      },
      attachment: {
        type: Sequelize.STRING,
        allowNull: true, // Allowing optional attachment (file upload)
      },
      createdByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
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
    await queryInterface.dropTable("deployment_requests");
  },
};
