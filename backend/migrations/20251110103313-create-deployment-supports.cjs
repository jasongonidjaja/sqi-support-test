"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("deployment_supports", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      application: {
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
      impactedApplication: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      note: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      attachment: {
        type: Sequelize.STRING,
        allowNull: true, // lokasi file (path upload)
      },
      riskImpact: {
        type: Sequelize.ENUM("Low", "Medium", "High", "Major Release"),
        allowNull: false,
      },
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
    await queryInterface.dropTable("deployment_supports");
  },
};
