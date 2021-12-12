"use strict";

module.exports = {
  plugins: ["jest", "jest-formatting"],
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      extends: [
        "@susisu/eslint-config/preset/ts-types",
        "plugin:eslint-comments/recommended",
        "prettier",
      ],
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      env: {
        es6: true,
      },
      rules: {
        "eslint-comments/no-unused-disable": "error",
      },
    },
    {
      files: ["*.{test,spec}.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
      extends: ["plugin:jest/recommended", "plugin:jest-formatting/recommended"],
      env: {
        "jest/globals": true,
      },
    },
    {
      files: ["examples/**/*.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
      },
    },
    {
      files: ["*.js"],
      extends: [
        "@susisu/eslint-config/preset/es",
        "plugin:eslint-comments/recommended",
        "prettier",
      ],
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: "script",
      },
      env: {
        es6: true,
        node: true,
      },
      rules: {
        "eslint-comments/no-unused-disable": "error",
      },
    },
  ],
};
