import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../startup/db";
import { User } from "./User";

export class Listing
  extends Model<InferAttributes<Listing>, InferCreationAttributes<Listing>>
{
  declare id: CreationOptional<number>;
  declare sellerId: number;
  declare title: string;
  declare description: string;
  declare price: number;
  declare currency: string;
  declare qty: number;
  declare status: "active" | "inactive" | "draft";
  declare tags: string[] | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Listing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "seller_id",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: "GHS",
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "draft"),
      allowNull: false,
      defaultValue: "active",
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
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
    tableName: "listings",
    modelName: "Listing",
  }
);

User.hasMany(Listing, { foreignKey: "sellerId", as: "listings" });
Listing.belongsTo(User, { foreignKey: "sellerId", as: "seller" });


