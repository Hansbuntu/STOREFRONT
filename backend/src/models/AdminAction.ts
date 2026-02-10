import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../startup/db";
import { User } from "./User";

export type AdminActionType =
  | "approve_seller"
  | "reject_seller"
  | "pause_listing"
  | "enable_listing"
  | "suspend_seller";

export type AdminTargetType = "seller" | "listing";

export class AdminAction extends Model<
  InferAttributes<AdminAction>,
  InferCreationAttributes<AdminAction>
> {
  declare id: CreationOptional<number>;
  declare adminId: number;
  declare actionType: AdminActionType;
  declare targetType: AdminTargetType;
  declare targetId: number;
  declare reason: string | null;
  declare createdAt: CreationOptional<Date>;
}

AdminAction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "admin_id",
    },
    actionType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "action_type",
    },
    targetType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "target_type",
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "target_id",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "admin_actions",
    modelName: "AdminAction",
    timestamps: false,
  }
);

User.hasMany(AdminAction, { foreignKey: "adminId", as: "adminActions" });
AdminAction.belongsTo(User, { foreignKey: "adminId", as: "admin" });
