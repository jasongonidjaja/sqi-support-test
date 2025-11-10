import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DeploymentSupport = sequelize.define(
  "DeploymentSupport",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    application: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    implementDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    impactedApplication: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: true, // lokasi file upload
    },
    riskImpact: {
      type: DataTypes.ENUM("Low", "Medium", "High", "Major Release"),
      allowNull: false,
    },
    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  },
  {
    tableName: "deployment_supports",
  }
);

export default DeploymentSupport;
