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
      type User = { name: string, tel?: string };
      const taro = { name: "taro" } as { name: string } | User
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type User = { name: string, tel?: string };
      const taro = { name: "taro" } as User | { name: string }
      const sampleUser: User = taro;
      `,
    },
    {
      code: `
      type TypeA = { name: string, tel?: string };
      type TypeB = { name: string, age: number };
      type TypeC = { name: string, tel?: string, age?: number };
      const taro = { name: "taro" } as TypeA | TypeB;
      const sampleUser: TypeC = taro;
      `,
    },
    {
      code: `
      type TypeA = { name: string, tel?: string };
      type TypeB = { name: string, age: number };
      const taro = { name: "taro" } as TypeA | TypeB;
      const sampleUser: TypeA | TypeB = taro;
      `,
    },
    {
      code: `
      type TypeA = { name: string, tel?: string };
      type TypeB = { name: string, age: number };
      const taro = { name: "taro", age: 33 } as TypeA | TypeB;
      const sampleUser: TypeA | TypeB = taro;
      `,
    },
  ],
  invalid: [
    {
      code: `
      type User = { name?: string, age?: number };
      const taro = { name: "taro" } as { name: string, tel: string } | { age: number };
      const user: User = taro;
      `,
      errors,
    },
    {
      code: `
      // union * union: string -> obj, string -> obj
      type User = string | { name: string };
      const taro = { name: "taro" } as string | { name: string, tel: string };
      const user: User = taro;
      `,
      errors,
    },
    {
      code: `
      // union * union: string -> obj, obj -> string
      type User = string | { name: string };
      const taro = { name: "taro" } as { name: string, tel: string } | string;
      const user: User = taro;
      `,
      errors,
    },
    {
      code: `
      // union * union: obj -> string, string -> obj
      type User = { name: string } | string;
      const taro = { name: "taro" } as string | { name: string, tel: string };
      const user: User = taro;
      `,
      errors,
    },
    {
      code: `
      // union * union: obj -> string, obj -> string
      type User = { name: string } | string;
      const taro = { name: "taro" } as { name: string, tel: string } | string;
      const user: User = taro;
      `,
      errors,
    },
    {
      code: `
      type TypeA = { name: string, tel?: string };
      type TypeB = { name: string, age: number };
      type TypeC = { name: string };
      type TypeD = { name: string, age: number };
      const taro = { name: "taro", age: 33 } as TypeA | TypeB;
      const sampleUser: TypeC | TypeD = taro;
      `,
      errors,
    },
  ],
});
