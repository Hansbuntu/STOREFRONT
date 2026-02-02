import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../startup/db";
import { Order } from "./Order";

export type EscrowReleaseStatus =
  | "HELD"
  | "RELEASED_TO_SELLER"
  | "REFUNDED_TO_BUYER"
  | "DISPUTED";

export class Escrow
  extends Model<InferAttributes<Escrow>, InferCreationAttributes<Escrow>>
{
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare amount: number;
  declare currency: string;
  declare heldAt: Date;
  declare releasedAt: Date | null;
  declare releasedTo: "seller" | "buyer" | null;
  declare releaseStatus: EscrowReleaseStatus;
  declare platformFee: number | null;
  declare ledgerReference: number | null;
}

Escrow.init(
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
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: "GHS",
    },
    heldAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "held_at",
    },
    releasedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "released_at",
    },
    releasedTo: {
      type: DataTypes.ENUM("seller", "buyer"),
      allowNull: true,
      field: "released_to",
    },
    releaseStatus: {
      type: DataTypes.ENUM(
        "HELD",
        "RELEASED_TO_SELLER",
        "REFUNDED_TO_BUYER",
        "DISPUTED"
      ),
      allowNull: false,
      defaultValue: "HELD",
      field: "release_status",
    },
    platformFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: "platform_fee",
    },
    ledgerReference: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "ledger_reference",
    },
  },
  {
    sequelize,
    tableName: "escrows",
    modelName: "Escrow",
  }
);

Order.hasOne(Escrow, { foreignKey: "orderId", as: "escrow" });
Escrow.belongsTo(Order, { foreignKey: "orderId", as: "order" });


