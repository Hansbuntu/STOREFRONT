"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("listings", "category");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_listings_category";'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("listings", "category", {
      type: Sequelize.ENUM(
        "music",
        "movies",
        "books",
        "electronics",
        "services",
        "fashion"
      ),
      allowNull: false,
      defaultValue: "music",
    });
  },
};
