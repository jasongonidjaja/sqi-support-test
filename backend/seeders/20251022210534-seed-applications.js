export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("applications", [
      { name: "OASE" },
      { name: "B24" },
      { name: "ALMOND" },
      { name: "MATCHA" },
      { name: "DBTOKEN" },
      { name: "NOTIFY" },
      { name: "SANDEZA" },
      { name: "SMS GATEWAY (MD MEDIA)" },
      { name: "BBLAST (RBIT)" },
      { name: "VISION" },
      { name: "NECTAR" },
      { name: "DDM" },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Applications", null, {});
  },
};
