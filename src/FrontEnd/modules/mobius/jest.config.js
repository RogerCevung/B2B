module.exports = {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // The paths to one or more modules that runs some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: ["./enzyme-setup.js"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

    // Indicates whether each individual test should be reported during the run
    verbose: true,
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.js?$": "babel-jest",
    },
};
