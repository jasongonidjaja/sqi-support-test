// src/models/index.js
import Task from "./Task.js";
import Application from "./Application.js";
import SupportType from "./SupportType.js";
import SQIPic from "./SQIPic.js";
import User from "./User.js";

// Relasi Application ↔ Task
Application.hasMany(Task, { foreignKey: "applicationId", as: "tasks" });
Task.belongsTo(Application, { foreignKey: "applicationId", as: "application" });

// Relasi SupportType ↔ Task
SupportType.hasMany(Task, { foreignKey: "supportTypeId", as: "tasks" });
Task.belongsTo(SupportType, { foreignKey: "supportTypeId", as: "supportType" });

// Relasi SQIPic ↔ Task
SQIPic.hasMany(Task, { foreignKey: "sqiPicId", as: "tasks" });
Task.belongsTo(SQIPic, { foreignKey: "sqiPicId", as: "sqiPic" });

// Relasi User ↔ Task
User.hasMany(Task, { foreignKey: "createdByUserId", as: "createdTasks" });
Task.belongsTo(User, { foreignKey: "createdByUserId", as: "createdBy" });

export { Task, Application, SupportType, SQIPic, User };
