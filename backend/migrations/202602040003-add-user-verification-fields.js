"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email_verified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("users", "email_verification_token_hash", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "email_verification_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "phone", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("users", "phone_verified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("users", "phone_otp_hash", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "phone_otp_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "phone_otp_last_sent_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "phone_otp_attempts", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn("users", "phone_otp_locked_until", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "phone_otp_locked_until");
    await queryInterface.removeColumn("users", "phone_otp_attempts");
    await queryInterface.removeColumn("users", "phone_otp_last_sent_at");
    await queryInterface.removeColumn("users", "phone_otp_expires_at");
    await queryInterface.removeColumn("users", "phone_otp_hash");
    await queryInterface.removeColumn("users", "phone_verified");
    await queryInterface.removeColumn("users", "phone");
    await queryInterface.removeColumn("users", "email_verification_expires_at");
    await queryInterface.removeColumn("users", "email_verification_token_hash");
    await queryInterface.removeColumn("users", "email_verified");
  },
};
