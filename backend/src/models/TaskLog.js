import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Pastikan koneksi DB sudah benar

const TaskLog = sequelize.define(
  "TaskLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tasks", // nama tabel di database
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    oldValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    newValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // pastikan sesuai dengan nama tabel user di DB kamu
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  },
  {
    tableName: "task_logs",
    timestamps: false, // ❌ Matikan timestamps bawaan Sequelize (karena kita hanya pakai createdAt)
  }
);

// 🔹 Relasi dengan model Task dan User
// TaskLog.associate = (models) => {
//   TaskLog.belongsTo(models.Task, { foreignKey: "taskId" });
//   TaskLog.belongsTo(models.User, { foreignKey: "userId" });
// };

export default TaskLog;
