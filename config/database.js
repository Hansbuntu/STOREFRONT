require("dotenv").config();

const common = {
  username: process.env.DB_USER || "storefront",
  password: process.env.DB_PASSWORD || "storefront",
  database: process.env.DB_NAME || "storefront",
  // Default to localhost so Node running on the host talks to the DB
  // exposed from docker-compose on 5432.
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
  logging: false
};

module.exports = {
  development: common,
  test: {
    ...common,
    database: process.env.DB_TEST_NAME || "storefront_test"
  },
  production: common
};


