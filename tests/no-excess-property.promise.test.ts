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
      type PromiseType = Promise<{ id: number }>;
      const promiseData = Promise.resolve({ id: 1 });
      const p: PromiseType = promiseData;
      `,
    },
    {
      code: `
      type PromiseType = Promise<{ id: number } | { age: number }>;
      const promiseData = Promise.resolve({ id: 1 });
      const p: PromiseType = promiseData;
      `,
    },
    {
      code: `
      type PromiseType = Promise<{ id: number } & { age: number }>;
      const promiseData = Promise.resolve({ id: 1, age: 20 });
      const p: PromiseType = promiseData;
      `,
    },
    {
      code: `
      type User = { name: string }
      type DummyPromise = Promise<{ hoge: Promise<User> }>
      let a: DummyPromise = {} as DummyPromise
      (async () => {
          const hoge = (await (await a).hoge)
          const user: User = hoge
      })();
      `,
    },
  ],
  invalid: [
    {
      code: `
      type PromiseType = Promise<{ id: number }>;
      const promiseData = Promise.resolve({ id: 1, age: 20 });
      const p: PromiseType = promiseData;
      `,
      errors,
    },
    {
      code: `
      type PromiseType = Promise<{ id: number } | { age: number }>;
      const promiseData = Promise.resolve({ id: 1, age: 20 });
      const p: PromiseType = promiseData;
      `,
      errors,
    },
    {
      code: `
      type PromiseType = Promise<{ id: number } | { age: number }>;
      const promiseData = Promise.resolve({ id: 1, age: 20 }) as Promise<{ id: number } | { id?: number, age: number }>;
      const p: PromiseType = promiseData;
      `,
      errors,
    },
  ],
});
