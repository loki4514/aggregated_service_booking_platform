export default {
    testEnvironment: "node",
    jest: {
        "verbose": true,
        "silent": false
    },

    // Load env variables BEFORE anything else
    setupFiles: ["<rootDir>/tests/setup.js"],

    // Load custom matchers, log suppression, etc. AFTER env is ready
    setupFilesAfterEnv: ["<rootDir>/tests/setupAfterEnv.js"],

    // File matching patterns
    testMatch: [
        "**/tests/**/*.test.js",
        "**/?(*.)+(spec|test).js"
    ],

    // Coverage config (optional)
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/index.js",
        "!src/config/**",
        "!**/node_modules/**"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],

    // Timeouts
    testTimeout: 30000,

    // Clear mocks between tests
    clearMocks: true,

    // Verbose output
    verbose: true,

    // Ensure ES Modules work (if using `"type": "module"` in package.json)
    extensionsToTreatAsEsm: [".js"],
    transform: {},
};