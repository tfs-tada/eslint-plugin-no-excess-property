import { TSESLint } from "@typescript-eslint/utils";
import rule from "../src/no-excess-property";

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.test.json",
    ecmaFeatures: {
      jsx: true,
    },
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
      function Components(props: { name: string }) {
        return <div>{props.name}</div>;
      }
      const app = <Components name="taro" />;
      `,
    },
    {
      code: `
      const Components = (props: { name: string }) => {
        return <div>{props.name}</div>;
      };
      const app = <Components name="taro" />;
      `,
    },
    {
      code: `
      const Components = (props: { name: string }) => {
        return <div>{props.name}</div>;
      };
      const user = { name: "taro" };
      const app = <Components {...user} />;
      `,
    },
    {
      code: `
      const Components = (props: { name: string }) => {
        return <div>{props.name}</div>;
      };
      const user = { name: "taro" };
      const app = <Components name="taro" {...user} />;
      `,
    },
    {
      code: `
      const Components = (props: { name: string; children: JSX.Element }) => {
        return <div>{props.name}</div>;
      };
      const user = { name: "taro" } as { name?: string };
      const app = (
        <Components name="taro" {...user}>
          <></>
        </Components>
      );
      `,
    },
    {
      code: `
      const Components = (props: { isHuman: boolean }) => {
        return <div>{props.isHuman ? "hoge" : "fuga"}</div>;
      };
      const user = { age: 10 };
      const app = <Components isHuman />;
      `,
    },
    {
      code: `
      const Components = (props: { name: string } | { age: number }) => {
        return <div>{"name" in props ? props.name : props.age}</div>;
      };
      const user = { age: 10 };
      const app = (
        <Components {...user}>
          <></>
        </Components>
      );
      `,
    },
    {
      code: `
      function Components(props: { name: string }) {
        return <div>{props.name}</div>;
      }
      const app = <Components name="taro" key={1} />;
      `,
    },
    {
      code: `
      type Props = {[K in \`hoge-\${string}\`]: string } & { age: number }
      const Component = (props: Props) => {
        return <div>{}</div>;
      }
      const user = { "hoge-testid": "file", age: 10 };
      const a = <Component {...user} />;
      `,
    },
    {
      code: `
      type Props = { data: {[K in \`hoge-\${string}\`]: string }} & { age: number }
      const Component = (props: Props) => {
        return <div>{}</div>;
      }
      const user = { data: {"hoge-testid": "file"}, age: 10 };
      const a = <Component data={user.data} age={user.age} />;
      `,
    },
    {
      code: `
      type Props = { data: {[K in \`hoge-\${string}\`]: string } & { age: number }}
      const Component = (props: Props) => {
        return <div>{}</div>;
      }
      const user = { data: {"hoge-testid": "file", age: 10 }};
      const a = <Component data={user.data} />;
      `,
    },
    {
      code: `
      const Components = (props: { name: string }) => {
        return <div>{props.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components {...user} />;
      `,
      options: [
        {
          skipWords: [],
          skipProperties: [],
          checkJsx: false,
          checkClass: false,
        },
      ],
    },
    {
      code: `
      type UserProps = { user: { name: string } }
      const Components = (props: UserProps) => {
        return <div>{props.user.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components user={user} />;      
      `,
      options: [
        {
          skipWords: ["UserProps"],
          skipProperties: [],
          checkJsx: true,
          checkClass: false,
        },
      ],
    },
    {
      code: `
      interface UserProps { user: { name: string } }
      const Components = (props: UserProps) => {
        return <div>{props.user.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components user={user} />;      
      `,
      options: [
        {
          skipWords: ["UserProps"],
          skipProperties: [],
          checkJsx: true,
          checkClass: false,
        },
      ],
    },
    {
      code: `
      type User = { name: string };
      type UserProps = { user: User }
      const Components = (props: UserProps) => {
        return <div>{props.user.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components user={user} />;      
      `,
      options: [
        {
          skipWords: ["User"],
          skipProperties: [],
          checkJsx: true,
          checkClass: false,
        },
      ],
    },
    {
      code: `
      const Components = (props: { name: string }) => {
        return <div>{props.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components {...user} />;
      `,
      options: [
        {
          skipWords: [],
          skipProperties: ["age"],
          checkJsx: true,
          checkClass: false,
        },
      ],
    },
    {
      code: `
      type UserProps = { user: { name: string } }
      const Components = (props: UserProps) => {
        return <div>{props.user.name}</div>;
      };
      const user = { name: "taro" };
      const app = <Components user={user} data-test="test" />;      
      `,
      options: [
        {
          skipWords: [],
          skipProperties: [],
          checkJsx: true,
          checkClass: false,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
      const Components = (props: { name: string }) => {
        return <div>{props.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components {...user} />;
      `,
      errors,
    },
    {
      code: `
      const Components = (props: { name: string }) => {
        return <div>{props.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components {...user} />;
      `,
      errors,
    },
    {
      code: `
      const Components = (props: { data: { name: string } }) => {
        return <div>{props.data.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components data={user} />;
      `,
      errors,
    },
    {
      code: `
      const Components = (props: { data: { name: string }, isHuman: boolean }) => {
        return <div>{props.data.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components data={user} isHuman />;
      `,
      errors,
    },
    {
      code: `
      type Props =
        | ({ name: string } & { age: number })
        | ({ name: string } & { id: string });
      const Component = (props: Props) => <div>{props.name}</div>;
      const user = { name: "Taro", age: 20, id: "user_id" };
      <Component {...user} />;
      `,
      errors,
    },
    {
      code: `
      type UserProps = { user: { name: string } }
      const Components = (props: UserProps) => {
        return <div>{props.user.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components user={user} />;      
      `,
      options: [
        {
          skipWords: ["Props"],
          skipProperties: [],
          checkJsx: true,
          checkClass: false,
        },
      ],
      errors,
    },
    {
      code: `
      const Components = (props: { name: string }) => {
        return <div>{props.name}</div>;
      };
      const user = { name: "taro", age: 10 };
      const app = <Components {...user} />;
      `,
      errors,
      options: [
        {
          skipWords: [],
          skipProperties: ["name"],
          checkJsx: true,
          checkClass: false,
        },
      ],
    },
    {
      code: `
      type UserProps = { user: { name: string } }
      const Components = (props: UserProps) => {
        return <div>{props.user.name}</div>;
      };
      // typo: data-test -> date-test
      const user = { name: "taro", "date-test": "test-id" };
      const app = <Components {...user} />;      
      `,
      options: [
        {
          skipWords: [],
          skipProperties: [],
          checkJsx: true,
          checkClass: false,
        },
      ],
      errors
    },
    // todo: fix this
    // {
    //   code: `
    //   type Props = {[K in \`hoge-\${string}\`]: string } & { age: number }
    //   const Component = (props: Props) => {
    //     return <div>{}</div>;
    //   }
    //   const user = { "hoge-testid": "file", age: 10, tel: "000-0000-0000" };
    //   const a = <Component {...user} />;
    //   `,
    //   errors,
    // },
  ],
});
