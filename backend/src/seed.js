const sequelize = require('./db');
const SupportType = require('./models/SupportType');
const SqiPic = require('./models/SQIPic');

(async () => {
  // 🔧 Matikan foreign key constraint sementara
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await sequelize.sync({ force: true });
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

  // 🔹 Isi data awal
  await SupportType.bulkCreate([
    { name: 'Testing' },
    { name: 'Bug Fix' },
    { name: 'Deployment Support' },
  ]);

  await SqiPic.bulkCreate([
    { name: 'Rina' },
    { name: 'Andi' },
    { name: 'Budi' },
  ]);

  console.log('✅ Seed data berhasil diisi!');
  process.exit();
})();
