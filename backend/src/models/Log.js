import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Log = sequelize.define(
  "Log",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false, // from users.username
    },

    // Generic title (task, deployment, support)
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Deployment fields
    deployment_releaseId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Support fields
    support_releaseId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    support_impactedApp: {
      type: DataTypes.STRING,
      allowNull: true,
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
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  },
  {
    tableName: "logs",
    timestamps: false,
  }
);

export default Log;
