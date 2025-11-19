"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      // 🔹 Support Type (opsional, bisa dari daftar)
      supportTypeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "support_types",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      // 🔹 Jika user mengetik custom support type
      customSupportType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // 🔹 Relasi ke aplikasi
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

      // 🔹 PIC SQI yang bertanggung jawab
      sqiPicId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sqi_pics",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      // 🔹 User yang membuat task
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

      // 🔹 Kolom attachment untuk menyimpan file path
      attachment: {
        type: Sequelize.STRING, // Menyimpan path file
        allowNull: true, // Bisa null saat tidak ada file
      },

      // 🔹 Status task
      status: {
        type: Sequelize.ENUM(
          "pending", 
          "in progress", 
          "completed", 
          "approved", 
          "rejected"
        ),
        allowNull: false,
        defaultValue: "pending", // Set default ke "pending"
      },

      // 🔹 Timestamps
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
    await queryInterface.dropTable("Tasks");
  },
};