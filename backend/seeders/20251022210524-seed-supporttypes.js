export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert("support_types", [
      { name: "Support Review Code UAT"},
      { name: "Support Rollout Pod UAT / Regresi"},
      { name: "Support Re-base Gitlab UAT / Regresi"},
      { name: "Request Slot UAT / Regresi" },
      { name: "Support Query UAT dan Regresi" },
      { name: "Request support implementasi" },
      { name: "Request open port" },
      { name: "Request pengadaan server" },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("support_types", null, {});
  },
};
