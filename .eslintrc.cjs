"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@saberhq/eslint-config"],
  parserOptions: {
    project: "tsconfig.json",
  },
  ignorePatterns: ["src/gql/*"],
};
