// @ts-nocheck
import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface /** @type {QueryInterface} */) => {
    const pics = await queryInterface.sequelize.query(
      "SELECT id FROM sqi_pics;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const picIds = pics.map((p) => p.id);

    const reqs = [];
    const impacts = ["Low", "Medium", "High", "Major Release"];
    const statuses = [null, "success", "redeploy", "cancel"];

    for (let i = 1; i <= 100; i++) {
      // Random offset -15 sampai +15 hari
      const offsetDays = Math.floor(Math.random() * 31) - 15;
      const implementDate = new Date();
      implementDate.setDate(implementDate.getDate() + offsetDays);

      reqs.push({
        releaseId: `REL-${1000 + i}`,
        title: `Deployment Request ${i}`,
        implementDate,
        applicationId: 1,
        riskImpact: impacts[Math.floor(Math.random() * impacts.length)],
        attachment: null,
        createdByUserId: Math.floor(Math.random() * 10) + 1,
        sqiPicId:
          picIds.length > 0
            ? picIds[Math.floor(Math.random() * picIds.length)]
            : null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("deployment_requests", reqs);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("deployment_requests", null, {});
  },
};
