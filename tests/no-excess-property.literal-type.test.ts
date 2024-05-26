import { TSESLint } from "@typescript-eslint/utils";
import rule from "../src/no-excess-property";

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.test.json",
  },
});

ruleTester.run("no-excess-property", rule, {
  valid: [
    {
      code: `
      type User = "taro" | "jiro";
      const taro = "taro";
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type UserType = "taro" | "jiro";
      class User { type: UserType = "taro"; };
      const taro = new User();
      const taroName: UserType = taro.type;
      `,
    },
  ],
  invalid: [],
});
