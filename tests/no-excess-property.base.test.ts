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
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = { name: string } & { age: number };
      const taro = { name: "taro", age: 10 };
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const sampleUser: User[] = [taro];
      `,
    },
    {
      code: `
      type User = { name: string };
      const name = { name: "taro" };
      const sampleUser: User = { name };
      `,
    },
    {
      code: `
      type User = { name: string };
      const addUser = (user: User[]) => {};
      const taro = { name: "taro" };
      addUser([taro]);
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const addUser = (user?: User) => {};
      addUser(taro);
      adduser();
      `,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = jiro as User;
      `,
    },
    {
      code: `
      type Func = () => void | number;
      const func: Func = () => { return };
      `,
    },
    {
      code: `
      type Func = () => void | number;
      const func: Func = () => {
        (async () => {})();
      };
      `,
    },
    {
      code: `
      type User = { name: string, child?: User };
      const taro: User = { name: "taro", child: { name: "jiro" } };
      `,
    },
    {
      code: `
      type User = { name: string, child?: User, sub?: { name: string, child?: User }};
      const taro: User = { name: "taro", child: { name: "jiro" }, sub: { name: "saburo", child: { name: "hoge" } } };
      `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User[] = [jiro];
      `,
      errors,
    },
    {
      code: `
      type User = { name: string, age: number };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: Pick<User, "age"> = jiro;
      `,
      errors,
    },
    {
      code: `
      type User = { name: string, age: number };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: Omit<User, "age"> = jiro;
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const addUser = (user: User) => {};
      const jiro = { name: "jiro", age: 10 };
      addUser(jiro);
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const addUser = (user: User) => {};
      const jiro = { name: "jiro", age: 10 };
      addUser(jiro);
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const addUser = (user: [[[[[User]]]]]) => {};
      addUser([[[[[jiro]]]]]);
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const addUser = (user: { key: [{ key: [{ key: User }] }] }) => {};
      addUser({ key: [{ key: [{ key: jiro }] }] });
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const addUser = (user: { key: [{ key: [{ key: User }] }] }) => {};
      addUser({ key: [{ key: [{ key: jiro }] }] });
      `,
      errors,
    },
    {
      code: `
      const buhi = {hoge: {fuga: () => {}, piyo: () => {}}};
      const func = (buhi:{hoge:{fuga:()=>void}}) => {};
      func(buhi);
      `,
      errors,
    },
  ],
});
