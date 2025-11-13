import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const FreezeDate = sequelize.define(
  "FreezeDate",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.ENUM("EOM", "EOY", "Cuti Bersama", "Tanggal Cantik", "Others"),
      allowNull: false,
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
    tableName: "freeze_dates",
    timestamps: true,
  }
);

export default FreezeDate;
