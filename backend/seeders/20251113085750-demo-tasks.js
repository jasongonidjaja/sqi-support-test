// @ts-nocheck
import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface /** @type {QueryInterface} */) => {
    // Ambil sqi_pics yang tersedia
    const pics = await queryInterface.sequelize.query(
      "SELECT id FROM sqi_pics;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const picIds = pics.map((p) => p.id);

    const tasks = [];

    for (let i = 1; i <= 100; i++) {
      tasks.push({
        title: `Task ${i}`,
        description: `Description for task ${i}`,
        supportTypeId: null,
        customSupportType: null,
        applicationId: 1, // ganti sesuai data kamu
        sqiPicId:
          picIds.length > 0
            ? picIds[Math.floor(Math.random() * picIds.length)]
            : null,
        createdByUserId: Math.floor(Math.random() * 10) + 1,
        attachment: null,
        status: ["pending", "in_progress", "completed"][Math.floor(Math.random() * 3)],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("tasks", tasks);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("tasks", null, {});
  },
};
