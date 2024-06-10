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
          skipWords: [],
          skipProperties: ["age"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["age"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["lastModified", "name", "webkitRelativePath"],
          checkJsx: false,
          checkClass: false,
        },
      ],
    },
    {
      code: `
      const func = (file: File): Blob => file;
      `,
      options: [
        {
          skipWords: [],
          skipProperties: ["lastModified", "name", "webkitRelativePath"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["lastModified", "name", "webkitRelativePath"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["age"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["name"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["name"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["lastModified", "name"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["lastModified", "name"],
          checkJsx: false,
          checkClass: false,
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
          skipWords: [],
          skipProperties: ["lastModified", "name"],
          checkJsx: false,
          checkClass: false,
        },
      ],
      errors: funcErrors,
    },
  ],
});
