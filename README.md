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
      { "skipWords": ["UncheckedTypeName"], "checkJsx": true }
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

## Exceptions

### Class

```ts
class BaseUser {
  name: string;
}
class ExtendedUser extends BaseUser {
  age: number;
}
const user: BaseUser = new ExtendedUser(); // OK
```

## Setting

```json
"rules": {
  "no-excess-property/no-excess-property": [
    "error",
    { "skipWords": ["UserElement"], "checkJsx": true }
  ]
},
```

### skipWords

Types registered in “skipwords” are not inspected.

```ts
type UserElement = { name: string };
const taro = { name: "Taro", age: 20 };
const element: UserElement = taro; // OK
```

### checkJsx

If `false`, the rule does not check JSX attributes. default is `true`.

## License

This project is published under the MIT license. For more details, see LICENSE.
