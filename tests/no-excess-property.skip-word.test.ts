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
      options: [{ skipWords: ["User"] }],
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const createUser = (user: User) => {};
      createUser(jiro);
      `,
      options: [{ skipWords: ["User"] }],
    },
    {
      code: `
      const func = (file: File): Blob => {
        return file;
      };
      `,
      options: [{ skipWords: ["Blob"] }],
    },
    {
      code: `
      const func = (file: File): Blob => file;
      `,
      options: [{ skipWords: ["Blob"] }],
    },
    {
      code: `
      function func(file: File): Blob {
        return file;
      };
      `,
      options: [{ skipWords: ["Blob"] }],
    },
  ],
  invalid: [
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const sampleUser: User = jiro;
      `,
      options: [{ skipWords: ["user"] }],
      errors
    },
    {
      code: `
      type User = { name: string };
      const jiro = { name: "jiro", age: 10 };
      const createUser = (user: User) => {};
      createUser(jiro);
      `,
      options: [{ skipWords: ["HogeType"] }],
      errors
    },
    {
      code: `
      const func = (file: File): Blob => {
        return file;
      };
      `,
      options: [{ skipWords: ["File"] }],
      errors: funcErrors,
    },
    {
      code: `
      const func = (file: File): Blob => file;
      `,
      options: [{ skipWords: ["File"] }],
      errors: funcErrors,
    },
    {
      code: `
      function func(file: File): Blob {
        return file;
      };
      `,
      options: [{ skipWords: ["File"] }],
      errors: funcErrors,
    },
  ],
});
