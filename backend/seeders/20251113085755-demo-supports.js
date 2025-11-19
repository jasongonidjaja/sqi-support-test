// @ts-nocheck
import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface /** @type {QueryInterface} */) => {
    const supports = [];
    const impacts = ["Low", "Medium", "High", "Major Release"];

    for (let i = 1; i <= 100; i++) {
      // Random offset -15 sampai +15 hari
      const offsetDays = Math.floor(Math.random() * 31) - 15;
      const implementDate = new Date();
      implementDate.setDate(implementDate.getDate() + offsetDays);

      supports.push({
        releaseId: `SUP-${2000 + i}`,
        application: `App ${((i % 5) + 1)}`,
        title: `Support Request ${i}`,
        implementDate,
        impactedApplication: `Impacted App ${(i % 7) + 1}`,
        note: null,
        attachment: null,
        riskImpact: impacts[Math.floor(Math.random() * impacts.length)],
        createdByUserId: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("supports", supports);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("supports", null, {});
  },
};
