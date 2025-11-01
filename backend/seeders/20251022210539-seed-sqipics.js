export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("Sqi_pics", [
      { name: "MDA" },
      { name: "FTH" },
      { name: "JSK" },
      { name: "FBT" },
      { name: "ADL" },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("SqiPics", null, {});
  },
};
