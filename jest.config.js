"use strict";

module.exports = {
  roots: ["./src"],
  testMatch: ["**/*.{test,spec}.{ts,tsx}"],
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["./src/**/*.{ts,tsx}", "!./src/**/*.{test,spec}.{ts,tsx}"],
  coverageDirectory: "coverage",
  globals: {
    "ts-jest": {
      tsConfig: "./tsconfig.test.json",
    },
  },
  transform: {
    "\\.tsx?$": "ts-jest",
  },
};
