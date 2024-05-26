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
      type Func = Function;
      const addUser: Function = (user) => {};
      const taro = { name: "taro" };
      addUser(taro);
      `,
    },
  ],
  invalid: [],
});
