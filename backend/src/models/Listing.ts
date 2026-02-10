import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../startup/db";
import { User } from "./User";

export type ListingCondition =
  | "new"
  | "used_like_new"
  | "used_good"
  | "used_fair";

export type ListingStatus = "active" | "paused" | "sold";

export class Listing
  extends Model<InferAttributes<Listing>, InferCreationAttributes<Listing>>
{
  declare id: CreationOptional<number>;
  declare sellerId: number;
  declare title: string;
  declare description: string | null;
  declare brand: string | null;
  declare model: string | null;
  declare sku: string | null;
  declare conditionDetails: string | null;
  declare color: string | null;
  declare size: string | null;
  declare material: string | null;
  declare weightKg: number | null;
  declare dimensions: string | null;
  declare warranty: string | null;
  declare returnPolicy: string | null;
  declare shippingMethod: string | null;
  declare handlingTimeDays: number | null;
  declare tags: string[] | null;
  declare itemSpecifics: Record<string, string> | null;
  declare priceGhs: number;
  declare location: string;
  declare condition: ListingCondition;
  declare imageUrl: string | null;
  declare shippingFeeGhs: number;
  declare quantity: number;
  declare escrowProtected: boolean;
  declare status: ListingStatus;
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
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    conditionDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "condition_details",
    },
    color: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    material: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    weightKg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "weight_kg",
    },
    dimensions: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    warranty: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    returnPolicy: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "return_policy",
    },
    shippingMethod: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: "shipping_method",
    },
    handlingTimeDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "handling_time_days",
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    itemSpecifics: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "item_specifics",
    },
    priceGhs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "price_ghs",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM(
        "new",
        "used_like_new",
        "used_good",
        "used_fair"
      ),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "image_url",
    },
    shippingFeeGhs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "shipping_fee_ghs",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    escrowProtected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "escrow_protected",
    },
    status: {
      type: DataTypes.ENUM("active", "paused", "sold"),
      allowNull: false,
      defaultValue: "active",
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
    timestamps: false,
  }
);

User.hasMany(Listing, { foreignKey: "sellerId", as: "listings" });
Listing.belongsTo(User, { foreignKey: "sellerId", as: "seller" });
