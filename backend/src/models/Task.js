// src/models/Task.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Application from "./Application.js";
import SQIPic from "./SQIPic.js";
import SupportType from "./SupportType.js";
import User from "./User.js";
import TaskLog from "./TaskLog.js";

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true, // ✅ pastikan Task juga punya PK
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  customSupportType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "applications", // ✅ huruf kecil, sesuai nama tabel
      key: "id",
    },
  },
  supportTypeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "support_types", // ✅ pastikan sesuai nama tabel
      key: "id",
    },
  },
  sqiPicId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "sqi_pics",
      key: "id",
    },
  },
  createdByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },

  attachment: {
    type: DataTypes.STRING, // Menyimpan path file
    allowNull: true, // Kolom attachment bisa kosong
  },

  status: {
    type: DataTypes.ENUM("pending", "in_progress", "completed", "approved", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  },
}, {
  tableName: "tasks",
  timestamps: true,
});

Task.belongsTo(Application, { foreignKey: "applicationId", as: "application" });
Task.belongsTo(SQIPic, { foreignKey: "sqiPicId", as: "sqiPic" });
Task.belongsTo(SupportType, { foreignKey: "supportTypeId", as: "supportType" });
Task.belongsTo(User, { foreignKey: "createdByUserId", as: "createdBy" });
Task.hasMany(TaskLog, { foreignKey: "taskId" });


export default Task;
