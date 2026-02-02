import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../startup/db";
import { encryptField, decryptField } from "../utils/crypto";

export type UserRole = "buyer" | "seller" | "admin" | "mediator";

export class User
  extends Model<InferAttributes<User>, InferCreationAttributes<User>>
{
  declare id: CreationOptional<number>;
  declare role: UserRole;
  declare pseudonym: string;
  declare email: string | null;
  declare passwordHash: string;
  declare kycStatus: "unverified" | "pending" | "verified" | "rejected";
  declare kycDocuments: string | null; // encrypted JSON
  declare payoutInfoEncrypted: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM("buyer", "seller", "admin", "mediator"),
      allowNull: false,
      defaultValue: "buyer",
    },
    pseudonym: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    kycStatus: {
      type: DataTypes.ENUM("unverified", "pending", "verified", "rejected"),
      allowNull: false,
      defaultValue: "unverified",
      field: "kyc_status",
    },
    kycDocuments: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "kyc_documents",
      get() {
        const raw = this.getDataValue("kycDocuments");
        if (!raw) return null;
        return decryptField(raw);
      },
      set(value: any) {
        if (!value) {
          this.setDataValue("kycDocuments", null);
          return;
        }
        this.setDataValue("kycDocuments", encryptField(value));
      },
    },
    payoutInfoEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "payout_info_encrypted",
      get() {
        const raw = this.getDataValue("payoutInfoEncrypted");
        if (!raw) return null;
        return decryptField(raw);
      },
      set(value: any) {
        if (!value) {
          this.setDataValue("payoutInfoEncrypted", null);
          return;
        }
        this.setDataValue("payoutInfoEncrypted", encryptField(value));
      },
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
    modelName: "User",
    tableName: "users",
  }
);


