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
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: [User] = [taro];
      `,
    },
    {
      code: `
      type User = { name: string };
      type User2 = { name: string, age: number };
      const taro = { name: "taro" };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: [User, User2] = [taro, jiro];
      `,
    },
    {
      code: `
      type User = { name: string };
      const addUser = (user: [User]) => {};
      const taro = { name: "taro" };
      addUser([taro]);
      `,
    },
    {
      code: `
      type User = { name: string };
      type User2 = { name: string, age: number };
      const taro = { name: "taro" };
      const jiro = { name: "jiro", age: 10 };
      const addUser = (user: [User, User2]) => {};
      addUser([taro, jiro]);
      `,
    },
    {
      code: `
      type User = { name: string };
      type User2 = { name: string, age: number };
      const taro = { name: "taro" };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: [(User | User2), User2] = [jiro, jiro];
      `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: [User] = [jiro];
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: [User, User] = [taro, jiro];
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const addUser = (user: [User]) => {};
      const jiro = { name: "jiro", age: 10 };
      addUser([jiro]);
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const addUser = (user: [User, User]) => {};
      const taro = { name: "taro" };
      const jiro = { name: "jiro", age: 10 };
      addUser([taro, jiro]);
      `,
      errors,
    },
  ],
});
