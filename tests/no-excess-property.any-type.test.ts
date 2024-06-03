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
      const addUser = (user: any) => {};
      const taro = { name: "taro" };
      addUser(taro);
      `,
    },
    {
      code: `
      const addUser = (user: {}) => {};
      const taro = { name: "taro" };
      addUser(taro);
      `,
    },
    {
      code: `
      const addUser = (user: object) => {};
      const taro = { name: "taro" };
      addUser(taro);
      `,
    },
    {
      code: `
      const addUser = (user: Object) => {};
      const taro = { name: "taro" };
      addUser(taro);
      `,
    },
    {
      code: `
      const addUser = (user: unknown) => {};
      const taro = { name: "taro" };
      addUser(taro);
      `,
    },
    {
      code: `
      type User = any;
      const taro = { name: "taro" };
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = {};
      const taro = { name: "taro" };
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = object;
      const taro = { name: "taro" };
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = Object;
      const taro = { name: "taro" };
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = unknown;
      const taro = { name: "taro" };
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = { name: string };
      const jiro: any = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
    },
    {
      code: `
      type User = { name: string };
      const jiro: {} = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
    },
    {
      code: `
      type User = { name: string };
      const jiro: object = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
    },
    // {
    //   ts-error - Type 'unknown' is not assignable to type 'User'.
    //   code: `
    //   type User = { name: string };
    //   const jiro: unknown = { name: "jiro", age: 10 };
    //   const sampleUser: User = jiro;
    //   `,
    // },
    // {
    //   ts-error - Type 'Object' is not assignable to type 'User'.
    //   code: `
    //   type User = { name: string };
    //   const jiro: Object = { name: "jiro", age: 10 };
    //   const sampleUser: User = jiro;
    //   `,
    // },
    {
      code: `
      type User = { name: string };
      const jiro: any = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: {} = jiro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: object = jiro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: Object = jiro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: unknown = jiro;
      `,
    },
    {
      code: `
      class Jiro {};
      const addUser = (func: Function) => {};
      addUser(Jiro);
      `,
    },
    {
      code: `
      type Users = { name: string }[] | []
      const taro = { name: "taro" };
      const users: Users = [];
      `,
    },
  ],
  invalid: [],
});
