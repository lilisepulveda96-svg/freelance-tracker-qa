// Load environment variables from .env file
require("dotenv").config();
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL,
    screenshotOnRunFailure: true,
    video: false,
  },
  env: {
    TEST_USER_EMAIL: process.env.CYPRESS_TEST_USER_EMAIL,
    TEST_USER_PASSWORD: process.env.CYPRESS_TEST_USER_PASSWORD,
  },
});
