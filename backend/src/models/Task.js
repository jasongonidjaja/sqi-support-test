// src/models/Task.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      // validate: { len: [3, 255] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      // validate: { len: [10] },
    },
    customSupportType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "applications", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    supportTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "support_types", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    sqiPicId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "sqi_pics", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
  }
);

export default Task;
