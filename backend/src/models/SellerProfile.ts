import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../startup/db";
import { User } from "./User";

export type SellerProfileStatus = "draft" | "pending" | "verified" | "rejected";

export class SellerProfile
  extends Model<
    InferAttributes<SellerProfile>,
    InferCreationAttributes<SellerProfile>
  >
{
  declare id: CreationOptional<number>;
  declare userId: number;
  declare storeName: string;
  declare storeDescription: string;
  declare storeLocation: string;
  declare contactEmail: string | null;
  declare contactPhone: string | null;
  declare policiesAccepted: boolean;
  declare status: SellerProfileStatus;
  declare adminNotes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SellerProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "user_id",
    },
    storeName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "store_name",
    },
    storeDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "store_description",
    },
    storeLocation: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "store_location",
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "contact_email",
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "contact_phone",
    },
    policiesAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "policies_accepted",
    },
    status: {
      type: DataTypes.ENUM("draft", "pending", "verified", "rejected"),
      allowNull: false,
      defaultValue: "draft",
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "admin_notes",
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
    tableName: "seller_profiles",
    modelName: "SellerProfile",
    timestamps: false,
  }
);

User.hasOne(SellerProfile, { foreignKey: "userId", as: "sellerProfile" });
SellerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
