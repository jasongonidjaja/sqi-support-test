import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import TaskLog from "./TaskLog.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["sqi", "developer"]],
    },
  },
}, {
  tableName: "users",
});

User.hasMany(TaskLog, { foreignKey: "userId" });

export default User;
