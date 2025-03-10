# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:6060](http://localhost:6060) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

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
