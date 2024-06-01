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
    "no-excess-property/no-excess-property": "error",
    "no-excess-property/no-excess-property-func": "error",
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2015,
    "sourceType": "module",
    "project": ["./tsconfig.json"],
    "tsconfigRootDir": __dirname,
  },
}
```

## Rules

`no-excess-propertiy` & `no-excess-property-func`

This rule prohibits excess properties in object assignments.

## Example

```typescript
type User = { name: string };
const taro = { name: 'Taro' };
const user1: User = taro; // OK

const jiro = { name: 'Jiro', age: 20 };
const user2: User = jiro; // Error

const users: User[] = [taro, jiro]; // Error
const dummyUsers: User[] = [...Array(10)].map((_, idx) => ({ name: `${idx}` })); // OK
const dummyUsers2: User[] = [...Array(10)].map((_, idx) => ({
  name: `${idx}`,
  age: idx,
})); // Error

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
