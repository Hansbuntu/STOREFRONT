import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../startup/db";
import { User } from "./User";
import { Listing } from "./Listing";

export type OrderStatus =
  | "new"
  | "paid_demo"
  | "fulfillment_submitted"
  | "released"
  | "refunded"
  | "disputed";

export class Order
  extends Model<InferAttributes<Order>, InferCreationAttributes<Order>>
{
  declare id: CreationOptional<number>;
  declare buyerId: number;
  declare sellerId: number;
  declare listingSnapshot: any;
  declare subtotalGhs: number;
  declare shippingGhs: number;
  declare totalGhs: number;
  declare currency: string;
  declare status: OrderStatus;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "buyer_id",
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "seller_id",
    },
    listingSnapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: "listing_snapshot",
    },
    subtotalGhs: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "subtotal_ghs",
    },
    shippingGhs: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "shipping_ghs",
    },
    totalGhs: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "total_ghs",
    },
    currency: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: "GHS",
    },
    status: {
      type: DataTypes.ENUM(
        "new",
        "paid_demo",
        "fulfillment_submitted",
        "released",
        "refunded",
        "disputed"
      ),
      allowNull: false,
      defaultValue: "new",
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
    tableName: "orders",
    modelName: "Order",
  }
);

User.hasMany(Order, { foreignKey: "buyerId", as: "buyerOrders" });
User.hasMany(Order, { foreignKey: "sellerId", as: "sellerOrders" });
Order.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });
Order.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

Listing.hasMany(Order, { foreignKey: "sellerId", sourceKey: "sellerId" });

