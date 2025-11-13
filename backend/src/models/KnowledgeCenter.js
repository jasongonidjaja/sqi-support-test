import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KnowledgeCenter = sequelize.define(
  "KnowledgeCenter",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    problem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "applications", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "knowledge_centers",
    timestamps: true,
  }
);

export default KnowledgeCenter;
