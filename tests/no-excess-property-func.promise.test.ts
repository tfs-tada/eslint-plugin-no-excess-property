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
  ],
  invalid: [
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
