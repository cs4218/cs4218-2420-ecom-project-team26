module.exports = {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)s
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/src/pages/admin/AdminDashboard.integration.test.js",
    "<rootDir>/client/src/pages/admin/AdminOrders.integration.test.js",
    "<rootDir>/client/src/pages/admin/Users.integration.test.js",
    "<rootDir>/client/src/components/AdminMenu.integration.test.js"
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/pages/admin/AdminDashboard.js",
    "client/src/pages/admin/AdminOrders.js",
    "client/src/pages/admin/Users.js",
    "client/src/components/AdminMenu.js"
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};
