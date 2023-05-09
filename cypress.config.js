const { defineConfig } = require("cypress")
require('dotenv').config()


module.exports = defineConfig({
  defaultCommandTimeout: 8000,
  pageLoadTimeout: 150000,
  requestTimeout: 5000,
  video: false,
  screenshotOnRunFailure: true,
  chromeWebSecurity: false,
  env: {
    URL: "https://app2.abtasty.com",
    USER1: "user@yahoo.com",
    PASS1: "Password123!",
    EMAILNOTINDB: "userNotInDB@yahoo.com",
    EMAILSSODOMEN: "user@ssodomen.com",
    EMAILFORMFA: "user@abtasty.com"
  },
  e2e: {
    watchForFileChanges: true,
  },
})
