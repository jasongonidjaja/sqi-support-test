import {
  DataTypes
} from "sequelize";
import sequelize from "../config/database.js";

const SupportType = sequelize.define("SupportType", {
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
  tableName: "support_types",
});

export default SupportType;