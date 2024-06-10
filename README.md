# eslint-plugin-no-excess-property

[![npm version](https://badge.fury.io/js/eslint-plugin-no-excess-property.svg)](https://badge.fury.io/js/eslint-plugin-no-excess-property)

This project provides an ESLint rule to prohibit excess properties in object assignments.

## Installation

```sh
npm install eslint eslint-plugin-no-excess-property --save-dev
```

## Usage

Add the following to your ESLint configuration file (such as .eslintrc):

```json
{
  "plugins": ["no-excess-property"],
  "rules": {
    "no-excess-property/no-excess-property": [
      "error",
      {
        "skipWords": ["UncheckedTypeName"],
        "skipProperties": ["uncheckedPropertyName"],
        "checkJsx": true,
        "checkClass": false
      }
    ]
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module",
    "project": ["./tsconfig.json"]
  }
}
```

## Example

### Object

```typescript
type User = { name: string };
const taro = { name: "Taro" };
const user1: User = taro; // OK

const jiro = { name: "Jiro", age: 20 };
const user2: User = jiro; // Error

const users: User[] = [taro, jiro]; // Error
const dummyUsers: User[] = [...Array(10)].map((_, idx) => ({ name: `${idx}` })); // OK
const dummyUsers2: User[] = [...Array(10)].map((_, idx) => ({
  name: `${idx}`,
  age: idx,
})); // Error
```

### JSX

```tsx
type Props = { name: string };
const Component = (props: Props) => <div>{props.name}</div>;
const user = { name: "Taro", age: 20 };
const appOk = <Component name={user.name} />; // OK
const appError = <Component {...user} />; // Error
```

### Function

```ts
type User = { name: string };
const taro = { name: "Taro" };
const jiro = { name: "Jiro", age: 20 };

const func = (user: User) => {};
func(taro); // OK
func(jiro); // Error

type Func = (user: User) => User;
const func2: Func = (user) => {
  const target = {
    name: user.name,
    age: 30,
  };
  return target; // Error
};
const func3: Func = (user) => {
  const okTarget = {
    name: user.name,
  };
  const errorTarget = {
    name: user.name,
    age: 30,
  };
  if (Math.random() > 0.5) {
    return errorTarget; // Error
  }
  return okTarget; // OK
};
```

## Setting

```json
"rules": {
  "no-excess-property/no-excess-property": [
    "error",
    { "skipWords": ["UserElement"], "skipProperties": ["age"], "checkJsx": true, "checkClass": false }
  ]
},
```

### skipWords

Types registered in `skipWords` are not inspected.

```ts
// "skipWords": ["UserElement"]
type UserElement = { name: string };
const taro = { name: "Taro", age: 20 };
const element: UserElement = taro; // OK
```

### skipProperties

Properties registered in `skipProperties` are not inspected.

```ts
// "skipProperties": ["age"]
type User = { name: string };
const taro = { name: "Taro", age: 20 };
const user: User = taro; // OK
```

default is `[]`.

### checkJsx

If `false`, the rule does not check JSX attributes. default is `true`.

### checkClass

If `false`, the rule does not check class properties. default is `false`.

```ts
class BaseUser {
  name: string;
}
class ExtendedUser extends BaseUser {
  age: number;
}
const user: BaseUser = new ExtendedUser(); // OK
```

## License

This project is published under the MIT license. For more details, see LICENSE.
