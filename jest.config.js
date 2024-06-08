module.exports = {
  preset: "ts-jest",
  testMatch: ["**/tests/**/*.ts", "**/tests/**/*.tsx",],
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.test.json",
      },
    ],
  },
};
