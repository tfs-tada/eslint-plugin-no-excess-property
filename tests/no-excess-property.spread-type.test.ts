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
      const sampleUser: User = { ...taro };
      `,
    },
    {
      code: `
      declare const AuthGuard: (type?: string | string[]) => {new (...args: any[]): {name: string}};
      class Hoge extends AuthGuard("admin") {}
      const addUser = (user: Function) => {};
      addUser(Hoge);
      `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = { ...jiro };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = { ...jiro, name: "taro" };
      `,
      errors,
    },
  ],
});
