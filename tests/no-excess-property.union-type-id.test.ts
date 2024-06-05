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
      const sampleUser: { age: number } | User = taro;
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: User | { age: number }  = taro;
      `,
    },
    {
      code: `
      const taro = { name: "taro" };
      const sampleUser: { name: string } | undefined = taro;
      `,
    },
    {
      code: `
      const taro = { name: "taro" };
      const sampleUser: undefined | { name: string } = taro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: { name: string } | any = jiro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: { name: string } | {} = jiro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: { name: string } | object = jiro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: { name: string } | Object = jiro;
      `,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: { name: string } | unknown = jiro;
      `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User | string = jiro;
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      type UserList = { users: User[], mainUser: User | null };
      const jiro = { name: "jiro", age: 10 };
      const sampleUserList: UserList = { users: [jiro], mainUser: null };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      type UserList = { users: User[], mainUser: User | null };
      const jiro = { name: "jiro", age: 10 };
      const sampleUserList: UserList = { users: [], mainUser: jiro };
      `,
      errors,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: { age: number } | { name: string } = jiro;
      `,
      errors,
    },
    {
      code: `
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: { age: number } | undefined = jiro;
      `,
      errors,
    },
    {
      code: `
      type Users = { name: string }[] | { age: number }[]
      const jiro = { name: "jiro", age: 10 };
      const users: Users = [jiro];
      `,
      errors,
    },
    {
      code: `
      type User = { name: string } | never
      const jiro = { name: "jiro", age: 10 };
      const users: User = jiro;
      `,
      errors,
    },
    {
      code: `
      type Users = { name: string }[] | never[]
      const jiro = { name: "jiro", age: 10 };
      const users: Users = [jiro];
      `,
      errors,
    },
    {
      code: `
      type Users = { name: string }[] | []
      const jiro = { name: "jiro", age: 10 };
      const users: Users = [jiro];
      `,
      errors,
    },
  ],
});
