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
      function func(human: { age: number }): undefined;
      function func(robot: { uuid: string }): undefined;
      function func(param: null): undefined;
      function func(prop: { age: number } | { uuid: string } | null) {}
      const human = { age: 10 };
      func(human);
    `,
    },
    {
      code: `
      function func(human: { age: number }): undefined;
      function func(robot: { uuid: string }): undefined;
      function func(param: null): undefined;
      function func(prop: { age: number } | { uuid: string } | null) {}
      const human = null;
      func(human);
    `,
    },
    {
      code: `
      function func(human: { age: number }): undefined;
      function func(robot: { uuid: string }): undefined;
      function func(param: null): undefined;
      function func(prop: { age: number } | { uuid: string } | null) {}
      const human = {} as any;
      func(human);
    `,
    },
    {
      code: `
      function func(param: undefined): undefined;
      function func(param: null): undefined;
      function func(prop: undefined | null) {}
      const human = null;
      func(human);
    `,
    },
    {
      code: `
      function func(param: null): undefined;
      function func(param: []): undefined;
      function func(prop: null | []) {}
      const human = [];
      func(human);
    `,
    },
  ],
  invalid: [
    {
      code: `
      function func(human: { age: number }): undefined;
      function func(robot: { uuid: string }): undefined;
      function func(param: null): undefined;
      function func(prop: { age: number } | { uuid: string } | null) {}
      const human = { age: 10, name: "taro" };
      func(human);
    `,
      errors,
    },
    {
      code: `
      function func(human: { age: number }): undefined;
      function func(robot: { uuid: string }): undefined;
      function func(param: null): undefined;
      function func(prop: { age: number } | { uuid: string } | null) {}
      const human = { age: 10, name: "uuid" };
      func(human);
    `,
      errors,
    },
  ],
});
