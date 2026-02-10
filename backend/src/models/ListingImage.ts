import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../startup/db";
import { Listing } from "./Listing";

export class ListingImage
  extends Model<InferAttributes<ListingImage>, InferCreationAttributes<ListingImage>>
{
  declare id: CreationOptional<number>;
  declare listingId: number;
  declare urlOrPath: string;
  declare sortOrder: number;
  declare createdAt: CreationOptional<Date>;
}

ListingImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "listing_id",
    },
    urlOrPath: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "url_or_path",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
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
    tableName: "listing_images",
    modelName: "ListingImage",
    timestamps: false,
  }
);

Listing.hasMany(ListingImage, { foreignKey: "listingId", as: "images" });
ListingImage.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });
