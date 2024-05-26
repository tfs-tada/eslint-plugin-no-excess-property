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
      class Fuga {
        fuga() {}
      }
      class Hoge extends Fuga {
        piyo() {}
      }
      const fuga = new Hoge();
      `,
    },
    {
      code: `
      class Hoge {
        fuga() {}
        piyo() {}
      }
      const hoge = new Hoge();
      const func = (d: {fuga: ()=>void}) => {};
      func(hoge);
      `,
    },
    {
      code: `
      class Hoge {
        fuga() {}
        piyo() {}
      }
      class Buhi {
        hoge = new Hoge();
      }
      const buhi = new Buhi();
      const func = (buhi:{hoge:{fuga:()=>void}}) => {};
      func(buhi);
      `,
    },
  ],
  invalid: [
  ],
});
