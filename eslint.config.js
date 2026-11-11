const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const globals = require("globals");

module.exports = [
    {
        ignores: ["lib/**"],
    },
    js.configs.recommended,
    react.configs.flat.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        files: ["*.config.js", "scripts/**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: globals.node,
        },
    },
    {
        files: ["**/*.test.js"],
        languageOptions: {
            globals: globals.jest,
        },
    },
];
