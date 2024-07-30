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

const funcErrors = [
  {
    messageId: "no-excess-property-func",
  },
] as const;

ruleTester.run("no-excess-property", rule, {
  valid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
      options: [
        {
          skipWords: ["User"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const createUser = (user: User) => {};
      createUser(jiro);
      `,
      options: [
        {
          skipWords: ["User"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
    },
    {
      code: `
      const func = (file: File): Blob => {
        return file;
      };
      `,
      options: [
        {
          skipWords: ["Blob"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
    },
    {
      code: `
      const func = (file: File): Blob => file;
      `,
      options: [
        {
          skipWords: ["Blob"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
    },
    {
      code: `
      function func(file: File): Blob {
        return file;
      };
      `,
      options: [
        {
          skipWords: ["Blob"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
    },
    {
      code: `
      type Human = { name: string };
      type Robot = { age: number };
      type User = Human | Robot;
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
      options: [
        {
          skipWords: ["User"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
      options: [
        {
          skipWords: ["user"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const createUser = (user: User) => {};
      createUser(jiro);
      `,
      options: [
        {
          skipWords: ["HogeType"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
      errors,
    },
    {
      code: `
      const func = (file: File): Blob => {
        return file;
      };
      `,
      options: [
        {
          skipWords: ["File"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
      errors: funcErrors,
    },
    {
      code: `
      const func = (file: File): Blob => file;
      `,
      options: [
        {
          skipWords: ["File"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
      errors: funcErrors,
    },
    {
      code: `
      function func(file: File): Blob {
        return file;
      };
      `,
      options: [
        {
          skipWords: ["File"],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
          targetProperties: [],
        },
      ],
      errors: funcErrors,
    },
  ],
});
