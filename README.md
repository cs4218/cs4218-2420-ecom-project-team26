## Setting Up and Running Tests

To set up and run tests for your components, follow these steps:

### 1. Add the File Path to the Files You Want to Test in `jest.frontend.config.js` or `jest.backend.config.js`

Ensure that the `testMatch` array in your `jest.frontend.config.js` includes the file paths for the test files you want to run. For example:

testMatch: [
"<rootDir>/client/src/pages/Auth/*.test.js",
"<rootDir>/client/src/pages/user/*.test.js",
"<rootDir>/client/src/context/*.test.js",
"<rootDir>/client/src/pages/*.test.js",
"<rootDir>/client/src/components/*.test.js",
"<rootDir>/client/src/pages/*.test.js"
]

### 2. Run the Specific Test File

To run the front end files, use the following command:
npm run test:frontend -- <Insert filename here>

To run the back end files, use:
npm run test:backend -- <Insert filename here>

To run a specific file for front/backend, use:
npm run test:<frontend> or <backend> -- <Insert filename here>

### 3. CI/CD test run

https://github.com/cs4218/cs4218-2420-ecom-project-team26/actions/runs/13750035955/job/38449830095
