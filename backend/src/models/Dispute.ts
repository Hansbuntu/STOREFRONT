import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../startup/db";
import { Order } from "./Order";
import { User } from "./User";

export type DisputeStatus =
  | "OPEN"
  | "AUTO_REFUND"
  | "AUTO_RELEASE"
  | "ESCALATED"
  | "RESOLVED";

export class Dispute
  extends Model<InferAttributes<Dispute>, InferCreationAttributes<Dispute>>
{
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare raisedBy: number;
  declare reason: string;
  declare evidenceRefs: any;
  declare evidenceScoreBuyer: number | null;
  declare evidenceScoreSeller: number | null;
  declare status: DisputeStatus;
  declare resolutionNotes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Dispute.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "order_id",
    },
    raisedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "raised_by",
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    evidenceRefs: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "evidence_refs",
    },
    evidenceScoreBuyer: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "evidence_score_buyer",
    },
    evidenceScoreSeller: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "evidence_score_seller",
    },
    status: {
      type: DataTypes.ENUM(
        "OPEN",
        "AUTO_REFUND",
        "AUTO_RELEASE",
        "ESCALATED",
        "RESOLVED"
      ),
      allowNull: false,
      defaultValue: "OPEN",
    },
    resolutionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "resolution_notes",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "disputes",
    modelName: "Dispute",
  }
);

Order.hasMany(Dispute, { foreignKey: "orderId", as: "disputes" });
Dispute.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Dispute.belongsTo(User, { foreignKey: "raisedBy", as: "raiser" });


