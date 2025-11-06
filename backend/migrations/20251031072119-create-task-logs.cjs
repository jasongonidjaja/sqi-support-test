"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("task_logs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tasks",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false, // Misalnya: "Status Change", "PIC Assigned"
      },
      oldValue: {
        type: Sequelize.STRING,
        allowNull: true, // Sebelumnya (misalnya status lama atau PIC lama)
      },
      newValue: {
        type: Sequelize.STRING,
        allowNull: false, // Nilai baru (misalnya status baru atau PIC baru)
      },
      userId: {
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("task_logs");
  },
};
