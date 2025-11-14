import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Support = sequelize.define(
  "Support",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    releaseId: {
      type: DataTypes.STRING,
      allowNull: false
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
    tableName: "supports",
  }
);

export default Support;
