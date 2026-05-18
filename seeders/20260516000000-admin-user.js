"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: uuidv4(),
          full_name: "Pabitra Ghara",
          email: "pabitra@gmail.com",
          password:
            "$2b$10$UHtw7B4.5b06zPkWNLGi/uh7gu9Fxc8APRMJirbw0PlLXI7gj5PGq",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", { email: "pabitra@gmail.com" }, {});
  },
};
