import { TSESLint } from "@typescript-eslint/utils";
import rule from "../src/no-excess-property-func";

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.test.json",
  },
});

const errors = [
  {
    messageId: "no-excess-property-func",
  },
] as const;

ruleTester.run("no-excess-property-func", rule, {
  valid: [
    {
      code: `
      type User = { name: string, hoge?: string };
      const func = (): User => {
        return { name: "334"}
      };
    `,
    },
    {
      code: `
      type Func = () => { name: string } | { age: number };
      const func: Func = () => { return { name: "taro" } };
      `,
    },
    {
      code: `
      type User = { name: string; hoge?: string };
      type UserFunc = () => User;
      const jiro = { name: "jiro", age: 10 };
      const func: UserFunc = () => { name: "taro" };
      `,
    },
    {
      code: `
      type User = { name: string };
      function func(): User {
        return { name: "taro" };
      }
      `,
    },
    {
      code: `
      type User = { name: string; date: Date };
      declare namespace Result {
        export { User };
      }
      type UserLocal =  Result.User;
      const a = (n: string, suffix = ""): UserLocal => {
        const t = new Date();
        t.setSeconds(t.getSeconds() - 10);
        return {
          name: n.toString() + suffix,
          date: t,
        };
      }
      `,
    },
    {
      code: `
      type Func<T> = (obj: T) => void;
      const func: Func<{ name: string }> = (obj) => {};
      func ({ name: "taro" });
      `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string, hoge?: string };
      const jiro = { name: "jiro", age: 10 };
      const func = (): User => {
        return jiro;
      };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const func = (): User | string => {
        return jiro;
      };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const func = (): User | void => {
        return jiro;
      };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string, hoge?: string };
      const jiro = { name: "jiro", age: 10 };
      const func = (): User => {
        if(Marh.random() > 0.5) {
          return jiro;
        }
        return { name: "taro" };
      };
      `,
      errors,
    },
    {
      code: `
      type User = { name: string, hoge?: string };
      const jiro = { name: "jiro", age: 10 };
      const func = (): User => jiro
      `,
      errors,
    },
    {
      code: `
      type User = { name: string, hoge?: string };
      const jiro = { name: "jiro", age: 10 };
      const func = (): User => 1===1 ? jiro : { name: "taro" }
      `,
      errors,
    },
    {
      code: `
      type User = { name: string; hoge?: string };
      type UserFunc = () => User;
      const jiro = { name: "jiro", age: 10 };
      const func: UserFunc = () => jiro;
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      function func(): User {
        return jiro;
      }
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      type UserFunc = () => User;
      const jiro = { name: "jiro" };
      const createUsers: UserFunc = () => {
        const users = [jiro].map(user=>({...user, age: 20}))
        return users
      };
      `,
      errors,
    },
  ],
});
