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
      const func = async () => {
        return 
      }
      `,
    },
    {
      code: `
      async function func() {
        return 
      }
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const func = async (): Promise<User> => {
        return taro
      }
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      async function func(): Promise<User> {
        return taro
      }
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const func = async (): Promise<{[name: string]: User}> => {
        return { taro }
      }
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const func = async (): Promise<{[name: string]: User}> => {
        return {taro}
      }
      `,
    },
    {
      code: `
      type Func = () => {id: number}
      const func: Func = () => {
        return { id: 1 }
      };
    `,
    },
    {
      code: `
      type Func = () => Promise<{id: number}>
      const func: Func = async() => {
        return { id: 1 }
      };
    `,
    },
    {
      code: `
      type Func = () => Promise<{id: number}>
      const func: Func = async() => {
        return Promise.resolve({ id: 1 })
      };
    `,
    },
    {
      code: `
      type Func = () => { id: number };
      const func: Func = () => {
        Promise.resolve({ id: 1 });
        (async () => {})();
        return { id: 1 };
      };
    `,
    },
    {
      code: `
      type Func = () => Promise<{id: number}>
      const func: Func = async() => ({ id: 1 })
    `,
    },
    {
      code: `
      type Func = () => Promise<{id: number}>
      const func: Func = async() => Promise.resolve({ id: 1 })
    `,
    },
    {
      code: `
      const func = (): Promise<{ id: number }> => {
        const asyncFunc = async () => ({ id: 1 });
        return asyncFunc();
      };
    `,
    },
    {
      code: `
      function func(): Promise<{ id: number }> {
        const asyncFunc = async () => ({ id: 1 });
        return asyncFunc();
      }
    `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const func = async (): Promise<User> => {
        const jiro = { name: "jiro", age: 10 };
        return jiro
      }
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      async function func(): Promise<User> {
        const jiro = { name: "jiro", age: 10 };
        return jiro
      }
      `,
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const func = async (): Promise<{[name: string]: User}> => {
        return { jiro }
      }
      `,
      errors
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const func = async (): Promise<{[name: string]: User}> => {
        return { jiro }
      }
      `,
      errors
    },
    {
      code: `
      type Func = () => {id: number}
      const func: Func = () => {
        return { id: 1, name: "taro" }
      };
    `,
      errors,
    },
    {
      code: `
      type Func = () => Promise<{id: number}>
      const func: Func = async() => {
        return { id: 1, name: "taro" }
      };
    `,
      errors,
    },
    {
      code: `
      type Func = () => Promise<{id: number}>
      const func: Func = async() => {
        return Promise.resolve({ id: 1, name: "taro" })
      };
    `,
      errors,
    },
    {
      code: `
      type Func = () => Promise<{id: number}>
      const func: Func = async() => ({ id: 1, name: "taro" })
    `,
      errors,
    },
    {
      code: `
      type Func = () => Promise<{id: number}>
      const func: Func = async() => Promise.resolve({ id: 1, name: "taro" })
    `,
      errors,
    },
  ],
});
