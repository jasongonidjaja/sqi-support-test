import bcrypt from "bcryptjs";

export async function up(queryInterface) {
  const hashedSqi = await bcrypt.hash("sqi123", 10);
  const hashedDev = await bcrypt.hash("dev123", 10);

  const users = [
    { username: "sqi1", password: hashedSqi, role: "sqi" },
    { username: "sqi2", password: hashedSqi, role: "sqi" },
    { username: "sqi3", password: hashedSqi, role: "sqi" },
    { username: "sqi4", password: hashedSqi, role: "sqi" },
    { username: "sqi5", password: hashedSqi, role: "sqi" },
    { username: "developer1", password: hashedDev, role: "developer" },
    { username: "developer2", password: hashedDev, role: "developer" },
    { username: "developer3", password: hashedDev, role: "developer" },
    { username: "developer4", password: hashedDev, role: "developer" },
    { username: "developer5", password: hashedDev, role: "developer" },
  ].map((u) => ({
    ...u,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await queryInterface.bulkInsert("users", users);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("users", null, {});
}
