# eslint-no-excess-property

[![npm version](https://badge.fury.io/js/eslint-plugin-no-excess-property.svg)](https://badge.fury.io/js/eslint-plugin-no-excess-property)

This project provides an ESLint rule to prohibit excess properties in object assignments.

## Installation

```sh
npm install eslint-plugin-no-excess-property --save-dev
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

Prohibits excess properties in object assignments. This will cause an error when trying to add an object with properties not present in the type to an array of that type.

## License

This project is published under the MIT license. For more details, see LICENSE.
