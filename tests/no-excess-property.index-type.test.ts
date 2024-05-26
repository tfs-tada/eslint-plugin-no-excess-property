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
      const sampleUser: Record<string, User> = { "1" : taro };
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: Record<number, User> = { 1 : taro };
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: {[key: string]: User} = { "1" : taro };
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: {[key: number]: User} = { 1 : taro };
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: {[key: number | string]: User} = { 1 : taro, "2": taro };
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: Record<string, User> = { taro };
      `,
    },

    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: [key: string] = { taro };
      `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: Record<number, User> = { 1: jiro };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: Record<string, User> = { "1": jiro };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: {[name: string]: User} = { jiro };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: {[name: string]: User} = { jiro: jiro };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      type UserList = { users: User[], mainUser: User | null };
      type UserListObj = { [name: string]: UserList };
      const jiro = { name: "jiro", age: 10 };
      const sampleUserObj: UserListObj = { teamA: { users: [jiro], mainUser: null } };
      `,
      errors,
    },
  ],
});
