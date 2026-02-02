"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM("buyer", "seller", "admin", "mediator"),
        allowNull: false,
        defaultValue: "buyer"
      },
      pseudonym: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kyc_status: {
        type: Sequelize.ENUM("unverified", "pending", "verified", "rejected"),
        allowNull: false,
        defaultValue: "unverified"
      },
      kyc_documents: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payout_info_encrypted: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  }
};


