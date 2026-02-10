module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "google_id", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("users", "auth_provider", {
      type: Sequelize.ENUM("local", "google"),
      allowNull: false,
      defaultValue: "local",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "auth_provider");
    await queryInterface.removeColumn("users", "google_id");
  },
};
