import {
  DataTypes
} from "sequelize";
import sequelize from "../config/database.js";

const Application = sequelize.define("Application", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "applications",
});

export default Application;