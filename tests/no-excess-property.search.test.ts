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
      const addUser = (user: {name:string}) => {};
      const taro = { name: "taro", age: 10 };
      addUser(taro);
      `,
      options: [
        {
          skipWords: ["User"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: ["sample"],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
      const addUser = (user: {name:string}) => {};
      const taro = { name: "taro", age: 10, sample: "sample" };
      addUser(taro);
      `,
      errors,
      options: [
        {
          skipWords: ["User"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: ["sample"],
        },
      ],
    },
    // {
    //   code: `
    //   const addUser = (user: {name:string}) => {};
    //   const taro = { name: "taro", age: 10, ex: {sample: "sample"} };
    //   addUser(taro);
    //   `,
    //   errors,
    //   options: [
    //     {
    //       skipWords: ["User"],
    //       skipProperties: [],
    //       checkJsx: false,
    //       checkClass: false,
    //       targetProperties: ["sample"],
    //     },
    //   ],
    // },
  ],
});
