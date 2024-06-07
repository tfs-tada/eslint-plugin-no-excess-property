import { TSESLint } from "@typescript-eslint/utils";
import rule from "../src/no-excess-property";

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.test.json",
  },
});

ruleTester.run("no-excess-property", rule, {
  valid: [
    {
      code: `
      const taro = { name: "taro", age: 10 };
      const addUser = <T extends { name: string }>(user: T) => {};
      addUser(taro);
      `,
    },

    {
      code: `
      const taro = "tarotaro";
      const addUser = <T extends any[]>(user: T) => {};
      addUser([taro]);
      `,
    },

    {
      code: `      
      const fn = <T,>(obj: T): { toBe: (o: T) => void } => ({
        toBe: () => console.log(obj),
      });
      const func = <T extends object | string>(
        obj: T,
      ): { toBe: (o: T) => void } => {
        return fn(obj);
      };
      func('hogemaru').toBe('hogemaru');
      `,
    },
    {
      code: `
      const fn = <T,>(obj: T): { toBe: (o: T) => void } => ({
        toBe: () => console.log(obj),
      });
      const func = <T extends object | string>(
        obj: T,
      ): { toBe: (o: T) => void } => {
        return fn(obj);
      };
      func('hogemaru' as any).toBe('hogemaru');
      `,
    },
    {
      code: `
      type Uniq = <T,>(array: T[]) => T[] | null | undefined;
      const uniq: Uniq = (array) => {
        return undefined;
      };
      const myArray = uniq([1, 2, 3]);
      `,
    },
    {
      code: `
      type Uniq = <T,>(array: T[]) => T[] | null | undefined;
      const uniq: Uniq = (array) => {
        return undefined;
      };
      const myArray = uniq([1, 2, 3]);
      `,
    },
    {
      code: `      
      type Props<T> = { data: T[] };
      const hoge: Props<{ name: string | null }> = { data: [{ name: "taro" }] }; 
      `,
    },
  ],
  invalid: [],
});
