import { TSESLint } from "@typescript-eslint/utils";
import rule from "../src/no-excess-property";

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.test.json",
  },
});

ruleTester.run("no-excess-property-func", rule, {
  valid: [
    {
      code: `
      const func = () => {
        return
      };
      `,
    },
    {
      code: `
      const func = () => {}
      `,
    },
    {
      code: `
      function func() {
        return 
      };
      `,
    },
    {
      code: `
      const func = () => {
        return null
      };
      `,
    },
    {
      code: `
      const func = () => null
      `,
    },
    {
      code: `
      function func() {
        return null
      };
      `,
    },
    {
      code: `
      const func = () => {
        return undefined
      };
      `,
    },
    {
      code: `
      const func = () => undefined
      `,
    },
    {
      code: `
      function func() {
        return undefined
      };
      `,
    },
    {
      code: `
      const func = (): any => {
        return { name: "taro" }
      };
      `,
    },
    {
      code: `
      const func = (): any => ({ name: "taro" })
      `,
    },
    {
      code: `
      function func(): any {
        return { name: "taro" }
      };
      `,
    },
    {
      code: `
      type Func = Function;
      const addUser: Function = (user) => {};
      const taro = { name: "taro" };
      addUser(taro);
      `,
    },
  ],
  invalid: [],
});
