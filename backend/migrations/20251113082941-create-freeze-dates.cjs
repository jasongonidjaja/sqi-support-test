"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("freeze_dates", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // 🔹 Tanggal mulai freeze
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // 🔹 Tanggal akhir freeze
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // 🔹 Alasan freeze (ENUM)
      reason: {
        type: Sequelize.ENUM(
          "EOM",
          "EOY",
          "Cuti Bersama",
          "Tanggal Cantik",
          "Others"
        ),
        allowNull: false,
        defaultValue: "Others",
      },

      // 🔹 User pembuat freeze date (biasanya SQI)
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
    await queryInterface.dropTable("freeze_dates");
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_freeze_dates_reason";');
  },
};
