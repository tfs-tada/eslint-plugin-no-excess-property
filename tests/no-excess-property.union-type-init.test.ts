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
      type User = { name: string, tel?: number };
      const taro = { name: "taro" } as { name: string } | User
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = { name: string, tel?: number };
      const taro = { name: "taro" } as User | { name: string }
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type TypeA = { name: string, tel?: number };
      type TypeB = { name: string, age: number };
      type TypeC = { name: string, tel?: number, age?: number };
      const taro = { name: "taro" } as TypeA | TypeB;
      const sampleUser: TypeC = taro;
      `,
    },
    {
      code: `
      type TypeA = { name: string, tel?: number };
      type TypeB = { name: string, age: number };
      const taro = { name: "taro" } as TypeA | TypeB;
      const sampleUser: TypeA | TypeB = taro;
      `,
    },
    {
      code: `
      type TypeA = { name: string, tel?: number };
      type TypeB = { name: string, age: number };
      const taro = { name: "taro", age: 33 } as TypeA | TypeB;
      const sampleUser: TypeA | TypeB = taro;
      `
    },
  ],
  invalid: [
    {
      code: `
      type User = { name?: string, age?: number };
      const taro = { name: "taro" } as { name: string, tel: number } | { age: number };
      const user: User = taro;
      `,
      errors,
    },
    {
      code: `
      type TypeA = { name: string, tel?: number };
      type TypeB = { name: string, age: number };
      type TypeC = { name: string };
      type TypeD = { name: string, age: number };
      const taro = { name: "taro", age: 33 } as TypeA | TypeB;
      const sampleUser: TypeC | TypeD = taro;
      `,
      errors
    },
  ],
});
