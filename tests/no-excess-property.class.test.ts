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
      class Fuga {
        fuga() {}
      }
      class Hoge extends Fuga {
        piyo() {}
      }
      const fuga: Fuga = new Hoge();
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
    {
      code: `
      class Fuga {
        fuga() {}
      }
      class Hoge extends Fuga {
        private hoge() {}
      }
      const fuga: Fuga = new Hoge();
      `,
      options: [{ checkClass: true, checkJsx: false, skipWords: [] }],
    },
    {
      code: `
      class Fuga {
        fuga() {}
      }
      class Hoge extends Fuga {
        private hoge = 10;
        private piyo() {}
      }
      const fuga: Fuga = new Hoge();
      `,
      options: [{ checkClass: true, checkJsx: false, skipWords: [] }],
    },
  ],
  invalid: [
    {
      code: `
      class Fuga {
        fuga() {}
      }
      class Hoge extends Fuga {
        piyo() {}
      }
      const fuga: Fuga = new Hoge();
      `,
      errors,
      options: [{ checkClass: true, checkJsx: false, skipWords: [] }],
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
      errors,
      options: [{ checkClass: true, checkJsx: false, skipWords: [] }],
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
      errors,
      options: [{ checkClass: true, checkJsx: false, skipWords: [] }],
    },
    {
      code: `
      class Fuga {
        fuga() {}
      }
      class Hoge extends Fuga {
        private hoge() {}
        piyo() {}
      }
      const fuga: Fuga = new Hoge();
      `,
      errors,
      options: [{ checkClass: true, checkJsx: false, skipWords: [] }],
    },
    {
      code: `
      class Fuga {
        fuga() {}
      }
      class Hoge extends Fuga {
        hoge = 10;
        private piyo() {}
      }
      const fuga: Fuga = new Hoge();
      `,
      errors,
      options: [{ checkClass: true, checkJsx: false, skipWords: [] }],
    },
  ],
});
