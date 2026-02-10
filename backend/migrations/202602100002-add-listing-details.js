"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("listings", "brand", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "model", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "sku", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "condition_details", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "color", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "size", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "material", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "weight_kg", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "dimensions", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "warranty", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "return_policy", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "shipping_method", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "handling_time_days", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "tags", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn("listings", "item_specifics", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("listings", "item_specifics");
    await queryInterface.removeColumn("listings", "tags");
    await queryInterface.removeColumn("listings", "handling_time_days");
    await queryInterface.removeColumn("listings", "shipping_method");
    await queryInterface.removeColumn("listings", "return_policy");
    await queryInterface.removeColumn("listings", "warranty");
    await queryInterface.removeColumn("listings", "dimensions");
    await queryInterface.removeColumn("listings", "weight_kg");
    await queryInterface.removeColumn("listings", "material");
    await queryInterface.removeColumn("listings", "size");
    await queryInterface.removeColumn("listings", "color");
    await queryInterface.removeColumn("listings", "condition_details");
    await queryInterface.removeColumn("listings", "sku");
    await queryInterface.removeColumn("listings", "model");
    await queryInterface.removeColumn("listings", "brand");
  },
};
