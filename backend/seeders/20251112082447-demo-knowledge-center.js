"use strict";

export async function up(queryInterface, Sequelize) {
  const problems = [
    "Error pada modul X yang menyebabkan gagal load data",
    "Service Y tidak merespons setelah update terakhir",
    "Database connection timeout saat query besar",
    "Login gagal meski kredensial benar",
    "Notifikasi email tidak terkirim ke beberapa user",
    "API endpoint Z mengembalikan 500 error",
    "Gagal generate report mingguan",
    "Data cache tidak terupdate setelah perubahan",
    "File upload gagal karena size limit",
    "Fitur search mengembalikan hasil tidak relevan",
    "UI crash saat scroll di halaman dashboard",
    "Integrasi dengan sistem pihak ketiga gagal",
    "Kesalahan validasi input pada form registrasi",
    "Token autentikasi kadaluwarsa terlalu cepat",
    "Gagal sinkronisasi data antar server",
    "Error parsing JSON dari response API",
    "Print PDF menghasilkan halaman kosong",
    "Upload gambar gagal dengan format tertentu",
    "Notifikasi push tidak muncul di Android",
    "Gagal reset password user",
    "Timeout saat import data CSV",
    "Error rendering chart di dashboard",
    "File log tidak ter-generate sesuai jadwal",
    "Kesalahan format tanggal pada laporan",
    "Gagal kirim SMS otomatis",
    "Service background berhenti mendadak",
    "Error saat migrasi database",
    "Gagal fetch data untuk widget tertentu",
    "Crash saat export Excel",
    "Email verifikasi tidak terkirim"
  ];

  const solutions = [
    "Restart service dan pastikan koneksi database stabil",
    "Update modul ke versi terbaru",
    "Periksa konfigurasi timeout dan optimasi query",
    "Reset password user atau cek integrasi autentikasi",
    "Periksa konfigurasi SMTP dan retry pengiriman",
    "Debug endpoint dan cek log error",
    "Pastikan scheduler report berjalan dan server aktif",
    "Clear cache dan reload data",
    "Tingkatkan limit upload atau kompres file",
    "Optimasi query search atau gunakan indexing",
    "Periksa versi browser dan update dependencies UI",
    "Cek API key dan koneksi ke pihak ketiga",
    "Validasi input sebelum dikirim ke server",
    "Perpanjang masa berlaku token atau refresh token",
    "Pastikan server sinkronisasi aktif",
    "Periksa format JSON dan handle exception",
    "Cek library PDF generator dan update",
    "Tambahkan validasi format gambar",
    "Periksa konfigurasi Firebase/FCM",
    "Reset token reset password",
    "Pisahkan file CSV besar menjadi beberapa batch",
    "Update library chart dan periksa data input",
    "Pastikan direktori log writable",
    "Gunakan format tanggal konsisten dan parsing aman",
    "Cek gateway SMS dan quota",
    "Monitor background service dan restart otomatis",
    "Pastikan script migrasi sesuai versi DB",
    "Periksa koneksi dan query widget",
    "Update library Excel dan periksa data input",
    "Periksa queue email dan retry mekanisme"
  ];

  const data = [];

  for (let i = 0; i < 30; i++) {
    const problemIndex = i % problems.length;
    const solutionIndex = i % solutions.length;

    data.push({
      problem: problems[problemIndex],
      solution: solutions[solutionIndex],
      createdByUserId: (i % 10) + 1, // userId 1–10
      applicationId: Math.floor(Math.random() * 12) + 1, // ✅ random 1–12
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await queryInterface.bulkInsert("knowledge_centers", data, {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("knowledge_centers", null, {});
}
