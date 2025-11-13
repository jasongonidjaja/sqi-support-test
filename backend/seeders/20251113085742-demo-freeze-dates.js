export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert("freeze_dates", [
    {
      startDate: new Date("2025-01-31T00:00:00Z"),
      endDate: new Date("2025-01-31T23:59:59Z"),
      reason: "EOM",
      createdByUserId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      startDate: new Date("2025-12-30T00:00:00Z"),
      endDate: new Date("2025-12-31T23:59:59Z"),
      reason: "EOY",
      createdByUserId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      startDate: new Date("2025-04-18T00:00:00Z"),
      endDate: new Date("2025-04-20T23:59:59Z"),
      reason: "Cuti Bersama",
      createdByUserId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      startDate: new Date("2025-05-05T00:00:00Z"),
      endDate: new Date("2025-05-05T23:59:59Z"),
      reason: "Tanggal Cantik",
      createdByUserId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      startDate: new Date("2025-07-17T00:00:00Z"),
      endDate: new Date("2025-07-18T23:59:59Z"),
      reason: "Others",
      createdByUserId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("freeze_dates", null, {});
}
