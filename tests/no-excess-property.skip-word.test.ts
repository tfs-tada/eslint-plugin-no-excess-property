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
      options: [{ skipWords: ["User"], checkJsx: false }],
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const createUser = (user: User) => {};
      createUser(jiro);
      `,
      options: [{ skipWords: ["User"], checkJsx: false }],
    },
    {
      code: `
      const func = (file: File): Blob => {
        return file;
      };
      `,
      options: [{ skipWords: ["Blob"], checkJsx: false }],
    },
    {
      code: `
      const func = (file: File): Blob => file;
      `,
      options: [{ skipWords: ["Blob"], checkJsx: false }],
    },
    {
      code: `
      function func(file: File): Blob {
        return file;
      };
      `,
      options: [{ skipWords: ["Blob"], checkJsx: false }],
    },
    {
      code: `
      type Human = { name: string };
      type Robot = { age: number };
      type User = Human | Robot;
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
      options: [{ skipWords: ["User"], checkJsx: false }],
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
      options: [{ skipWords: ["user"], checkJsx: false }],
      errors,
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const createUser = (user: User) => {};
      createUser(jiro);
      `,
      options: [{ skipWords: ["HogeType"], checkJsx: false }],
      errors,
    },
    {
      code: `
      const func = (file: File): Blob => {
        return file;
      };
      `,
      options: [{ skipWords: ["File"], checkJsx: false }],
      errors: funcErrors,
    },
    {
      code: `
      const func = (file: File): Blob => file;
      `,
      options: [{ skipWords: ["File"], checkJsx: false }],
      errors: funcErrors,
    },
    {
      code: `
      function func(file: File): Blob {
        return file;
      };
      `,
      options: [{ skipWords: ["File"], checkJsx: false }],
      errors: funcErrors,
    },
  ],
});
