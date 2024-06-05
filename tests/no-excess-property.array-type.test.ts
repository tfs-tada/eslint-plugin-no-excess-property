import { TSESLint } from "@typescript-eslint/utils";
import rule from "../src/no-excess-property";

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.test.json",
  },
});

// const errors = [
//   {
//     messageId: "no-excess-property",
//   },
// ] as const;

ruleTester.run("no-excess-property", rule, {
  valid: [
    {
      code: `
      type Arr = ReadonlyArray<unknown>;
      const func: Arr = [];
      `,
    },
    {
      code: `
      type Arr = ReadonlyArray<unknown>;
      const func: Arr = ["taro", 33];
      `,
    },
    {
      code: `
      type User = { name: string };
      const taro = { name: "taro" };
      const jiro = { name: "jiro" };
      const saburo = { name: "saburo" };
      const users: User[] = [taro, jiro, saburo];
      `,
    },
  ],
  invalid: [
    // todo: fix this
    // {
    //   code: `
    //   type User = { name: string };
    //   const taro = { name: "taro", age: 10 };
    //   const jiro = { name: "jiro" };
    //   const saburo = { name: "saburo" };
    //   const users: User[] = [taro, jiro, saburo];
    //   `,
    //   errors,
    // },
    // {
    //   code: `
    //   type User = { name: string };
    //   const taro = { name: "taro" };
    //   const jiro = { name: "jiro", age: 10 };
    //   const saburo = { name: "saburo" };
    //   const users: User[] = [taro, jiro, saburo];
    //   `,
    //   errors,
    // },
    // {
    //   code: `
    //   type User = { name: string };
    //   const taro = { name: "taro" };
    //   const jiro = { name: "jiro" };
    //   const saburo = { name: "saburo", age: 10 };
    //   const users: User[] = [taro, jiro, saburo];
    //   `,
    //   errors,
    // },
  ],
});
