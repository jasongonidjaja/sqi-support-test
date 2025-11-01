export async function up(queryInterface) {
  await queryInterface.bulkInsert("users", [
    {
      username: "sqi1",
      password: "sqi123",  // Mudah, plain text password
      role: "sqi",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "sqi2",
      password: "sqi123",  // Mudah, plain text password
      role: "sqi",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "developer1",
      password: "dev123",  // Mudah, plain text password
      role: "developer",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "developer2",
      password: "dev123",  // Mudah, plain text password
      role: "developer",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("Users", null, {});
}
