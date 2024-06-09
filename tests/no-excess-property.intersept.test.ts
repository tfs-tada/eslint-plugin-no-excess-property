import { TSESLint } from "@typescript-eslint/utils";
import rule from "../src/no-excess-property";

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.test.json",
  },
});

const errors = [
  {
    messageId: "no-excess-property",
  },
] as const;

ruleTester.run("no-excess-property", rule, {
  valid: [
    {
      code: `
      type User = { name: string } & { age: number };
      const taro = { name: "taro", age: 10 };
      const sampleUser: User = taro;
      `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string } & { age: number };
      const taro = { name: "taro", age: 10, tel: "123-4567-8901" };
      const sampleUser: User = taro;
      `,
      errors,
    },
  ],
});
