import sequelize from '../config/database.js';

import Task from './Task.js';
import Application from './Application.js';
import SupportType from './SupportType.js';
import SQIPic from './SQIPic.js';
import User from './User.js';
import Log from './Log.js'; // <-- updated
import DeploymentRequest from './DeploymentRequest.js';
import Support from './Support.js';
import KnowledgeCenter from './KnowledgeCenter.js';

// =====================
// Definisikan Relasi
// =====================

// Application ↔ Task
Application.hasMany(Task, {
  foreignKey: 'applicationId',
  as: 'tasks',
});
Task.belongsTo(Application, {
  foreignKey: 'applicationId',
  as: 'taskApplication',
});

// SupportType ↔ Task
SupportType.hasMany(Task, {
  foreignKey: 'supportTypeId',
  as: 'tasks',
});
Task.belongsTo(SupportType, {
  foreignKey: 'supportTypeId',
  as: 'supportType',
});

// SQIPic ↔ Task
SQIPic.hasMany(Task, {
  foreignKey: 'sqiPicId',
  as: 'tasks',
});
Task.belongsTo(SQIPic, {
  foreignKey: 'sqiPicId',
  as: 'sqiPic',
});

// User ↔ Task (createdBy)
User.hasMany(Task, {
  foreignKey: 'createdByUserId',
  as: 'createdTasks',
});
Task.belongsTo(User, {
  foreignKey: 'createdByUserId',
  as: 'createdBy',
});

// Application ↔ DeploymentRequest
Application.hasMany(DeploymentRequest, {
  foreignKey: 'applicationId',
  as: 'deploymentRequests',
});
DeploymentRequest.belongsTo(Application, {
  foreignKey: 'applicationId',
  as: 'application',
});

// ❌ HAPUS relasi User ↔ TaskLog karena tidak ada foreign key lagi
// User.hasMany(TaskLog, { ... })
// TaskLog.belongsTo(User, { ... })

// User ↔ Support
User.hasMany(Support, {
  foreignKey: 'createdByUserId',
  as: 'createdSupports',
});
Support.belongsTo(User, {
  foreignKey: 'createdByUserId',
  as: 'createdBy',
});

// User ↔ Deployment Request
User.hasMany(DeploymentRequest, {
  foreignKey: 'createdByUserId',
  as: 'createdRequests',
});
DeploymentRequest.belongsTo(User, {
  foreignKey: 'createdByUserId',
  as: 'createdBy',
});

// User ↔ KnowledgeCenter
User.hasMany(KnowledgeCenter, {
  foreignKey: 'createdByUserId',
  as: 'createdKnowledgeCenters',
});
KnowledgeCenter.belongsTo(User, {
  foreignKey: 'createdByUserId',
  as: 'createdBy',
});

// Application ↔ KnowledgeCenter
Application.hasMany(KnowledgeCenter, {
  foreignKey: 'applicationId',
  as: 'knowledgeCenters',
});
KnowledgeCenter.belongsTo(Application, {
  foreignKey: 'applicationId',
  as: 'application',
});

// =====================
// Export Semua Model
// =====================
const models = {
  Task,
  Application,
  SupportType,
  SQIPic,
  User,
  DeploymentRequest,
  Support,
  KnowledgeCenter,
  Log, // <-- updated
};

export default models;
