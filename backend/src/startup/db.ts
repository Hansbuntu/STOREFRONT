import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || "storefront",
  process.env.DB_USER || "storefront",
  process.env.DB_PASSWORD || "storefront",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  }
);

export async function initDb() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log("Database connection established");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Unable to connect to DB", err);
    process.exit(1);
  }
}


