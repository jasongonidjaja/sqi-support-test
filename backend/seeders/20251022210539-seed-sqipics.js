export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("sqi_pics", [
      { name: "MDA" },
      { name: "FTH" },
      { name: "JSK" },
      { name: "FBT" },
      { name: "ADL" },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("sqi_pics", null, {});
  },
};
