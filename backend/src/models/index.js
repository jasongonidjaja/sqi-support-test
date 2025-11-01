// src/models/index.js
import sequelize from "../config/database.js";

import Task from "./Task.js";
import Application from "./Application.js";
import SupportType from "./SupportType.js";
import SQIPic from "./SQIPic.js";
import User from "./User.js";
import DeploymentRequest from "./DeploymentRequest.js";

// =====================
// 🔹 Definisikan Relasi
// =====================

// Application ↔ Task
Application.hasMany(Task, { foreignKey: "applicationId", as: "tasks" });
Task.belongsTo(Application, { foreignKey: "applicationId", as: "taskApplication" });

// SupportType ↔ Task
SupportType.hasMany(Task, { foreignKey: "supportTypeId", as: "tasks" });
Task.belongsTo(SupportType, { foreignKey: "supportTypeId", as: "supportType" });

// SQIPic ↔ Task
SQIPic.hasMany(Task, { foreignKey: "sqiPicId", as: "tasks" });
Task.belongsTo(SQIPic, { foreignKey: "sqiPicId", as: "sqiPic" });

// User ↔ Task
User.hasMany(Task, { foreignKey: "createdByUserId", as: "createdTasks" });
Task.belongsTo(User, { foreignKey: "createdByUserId", as: "createdBy" });

// Application ↔ DeploymentRequest
Application.hasMany(DeploymentRequest, {
  foreignKey: "applicationId",
  as: "deploymentRequests",
});
DeploymentRequest.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
});

// =====================
// 🔹 Export Semua Model
// =====================
const models = {
  sequelize,
  Task,
  Application,
  SupportType,
  SQIPic,
  User,
  DeploymentRequest,
};

console.log("✅ Associations initialized successfully");

export default models;
