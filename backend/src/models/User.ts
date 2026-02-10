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
  declare emailVerified: boolean;
  declare emailVerificationTokenHash: string | null;
  declare emailVerificationExpiresAt: Date | null;
  declare googleId: string | null;
  declare authProvider: "local";
  declare phone: string | null;
  declare phoneVerified: boolean;
  declare phoneOtpHash: string | null;
  declare phoneOtpExpiresAt: Date | null;
  declare phoneOtpLastSentAt: Date | null;
  declare phoneOtpAttempts: number;
  declare phoneOtpLockedUntil: Date | null;
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
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "email_verified",
    },
    emailVerificationTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "email_verification_token_hash",
    },
    emailVerificationExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "email_verification_expires_at",
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: "google_id",
    },
    authProvider: {
      type: DataTypes.ENUM("local"),
      allowNull: false,
      defaultValue: "local",
      field: "auth_provider",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "phone_verified",
    },
    phoneOtpHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "phone_otp_hash",
    },
    phoneOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "phone_otp_expires_at",
    },
    phoneOtpLastSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "phone_otp_last_sent_at",
    },
    phoneOtpAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "phone_otp_attempts",
    },
    phoneOtpLockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "phone_otp_locked_until",
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
    // created_at/updated_at are managed by migration defaults
    timestamps: false,
  }
);
