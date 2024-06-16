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
      const sampleUser: { [key: number | string]: User } = { 1: taro, "2": taro };
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
      const taro = { name: "taro", age: "20" };
      const sampleUser: { [key: string]: string; name: string } = taro;
      `,
    },
    {
      code: `
      const taro = { age: 20, name: "taro", version: 1 };
      const sampleUser: { [key: string]: string; age: number } = taro;
      `,
    },
    {
      code: `
      const taro = { age: 20, name: "taro", uuid: "uuid" };
      const sampleUser: { [key in "name" | "uuid"]: string } & { age: number } = taro;
      `,
    },
    {
      code: `
      type User = { [propertyName: \`hoge-\${string}\`]: string } & { name: string };
      const taro = { "hoge-name": "taro", name: "taro" };
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = { data: {[propertyName: \`hoge-\${string}\`]: string } & { name: string }};
      const taro = { data: { "hoge-name": "taro", name: "taro" }};
      const sampleUser: User = taro;
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
    {
      code: `
      const taro = { age: 20, name: "taro", uuid: "uuid", version: 1 };
      const sampleUser: { [key in "name" | "uuid"]: string } & { age: number } = taro;
      `,
      errors,
    },
    // todo: fix this
    // {
    //   code: `
    //   type User = { [propertyName: \`hoge-\${string}\`]: string } & { name: string };
    //   const taro = { "hoge-name": "taro", name: "taro", age: 20 };
    //   const sampleUser: User = taro;
    //   `,
    //   errors
    // },
  ],
});
