# no-excess-property

TypeScript often causes problems such as information leakage due to excess properties. This eslint-plugin allows you to ban excess properties.

## options

- `skipWords` (default: `["Element", "HTMLElement", "ReactNode", "ReactElement", "FC"]`): Type names. If a type name is included in skipWords, it will not be checked.
- `skipProperties` (default: `[]`): Property names. If a property name is included in skipProperties, it will not be checked.
- `checkJsx` (default: `true`): If true, JSX elements will be checked.
- `checkClass` (default: `true`): If true, class instances will be checked.

```ts
// "skipWords": ["UserElement"]
type UserElement = { name: string };
const taro = { name: "Taro", age: 20 };
const element: UserElement = taro; // OK

// "skipProperties": ["skipProperty"]
type User = { name: string };
const taro = { name: "Taro", skipProperty: "000-000-000" };
const user: User = taro; // OK
```

## sample

These are just a few examples. Feel free to open an issue if you have any questions!

### variable

- Excess properties are not allowed.

```ts
type User = { name: string };
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };
const user1 = alice; // OK
const user2 = bob; // Error
```

- If `any` or `unknown` is used, the object will not be checked.

```ts
type User = { name: string };
const alice = { name: "Alice", age: 20 } as any;
const user: User = alice; // OK
```

- array & tuple

```ts
type User = { name: string };
const arrayOk: User[] = [...Array(3)].map((_, i) => ({ name: `user${i}` })); // OK
const arrayError: User[] = [...Array(3)].map((_, i) => ({
  name: `user${i}`,
  age: i,
})); // Error

type Users = [User, User];
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };
const tupleOk: Users = [alice, alice]; // OK
const tupleError: Users = [alice, bob]; // Error
```

- Index Signatures

```ts
type User = { name: string };
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };
const objOk: { [key: string]: User } = { alice }; // OK
const objError: { [key: string]: User } = { alice, bob }; // Error
```

- Union Types

```ts
type User = { name: string };
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };
const unionOk: User | { age: number } = alice; // OK
const unionError: User | { age: number } = bob; // Error

type UserData = { name: string; age: number };
const cherry = { name: "Cherry" } as User | UserData;
const cherryUserOk: User | UserData = cherry; // OK
const cherryUserError: User = cherry; // Error
```

- Nested Objects with Arrays

```ts
type User = {
  name: string;
  age: number;
  address: {
    city: string;
    log: {
      lat: number;
      lng: number;
    }[];
  };
};
const alice = {
  name: "Alice",
  age: 20,
  address: {
    city: "Tokyo",
    log: [{ lat: 35.6895, lng: 139.6917 }],
  },
};
const bob = {
  name: "Bob",
  age: 20,
  address: {
    city: "Tokyo",
    log: [
      { lat: 35.6895, lng: 139.6917 },
      { lat: 35.6895, lng: 139.6917, time: "2021-01-01" },
    ],
  },
};
const userOk: User = alice; // OK
const userError: User = bob; // Error: Object has property not present "time" in type
```

- Object

```ts
type User = Object;
const alice = { name: "Alice" };
const user: User = alice; // OK
```

### function

- Function Variables

```ts
type User = { name: string };
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };

function func1(): User {
  return alice; // OK
}
function func2(): User {
  return bob; // Error
}
const func3 = (): User => alice; // OK
const func4 = (): User => bob; // Error
```

- Function Calls

```ts
type User = { name: string };
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };
const func = (user: User) => {};
func(alice); // OK
func(bob); // Error˝
```

- Promise-based Functions

```ts
type User = { name: string };
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };
const func1 = async (): Promise<User> => alice; // OK
const func2 = async (): Promise<User> => bob; // Error
```

- If Generics are Used, They are Generally Unchecked.

```ts
const alice = { name: "Alice", age: 20 };
const addUser = <T extends { name: string }>(user: T) => {};
addUser(alice); // OK
```

- Function Overloads

```ts
type User = { name: string };
type UserAge = { age: number };
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };
function func(user: User): void;
function func(user: UserAge): void;
function func(user: User | UserAge): void {}
func(alice); // OK
func(bob); // Error
```

### jsx

If `checkJsx` is true, excess properties in JSX elements are not allowed.

```tsx
type Props = { name: string };
const Component = (props: Props) => <div>{props.name}</div>;
const alice = { name: "Alice" };
const bob = { name: "Bob", age: 20 };
const appOk = <Component name={alice.name} />; // OK
const appError = <Component {...bob} />; // Error
```

`key` or `data-xx` attributes are not checked.

```tsx
type Props = { name: string };
const Component = (props: Props) => <div>{props.name}</div>;
const alice = { name: "Alice", key: 1, "data-id": "id" };
const appOk = <Component {...alice} />; // OK
```

### class

If `checkClass` is true, excess properties in class instances are not allowed. However, it is recommended to set `checkClass` to false, as it may be incompatible with class inheritance.

```ts
class Fuga {
  fuga() {}
}
class Hoge extends Fuga {
  piyo() {}
}
const fuga: Fuga = new Hoge(); // error
```

- Private properties are not checked.

```ts
class BaseUser {}
class User extends BaseUser {
  private name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
}
const alice = new User("Alice");
const user: BaseUser = alice; // OK
```

### todo

- Support for cases where tuples are used in arrays

```ts
type User = { name: string };
const taro = { name: "taro" };
const jiro = { name: "jiro", age: 10 };
const users: User[] = [taro, jiro]; // expected error but no error
```

- Support for cases where template-literal index signatures are used in objects

```ts
type Props = { age: number } & { [name: `data-${string}`]: string };
const user = { "data-testid": "file", age: 20, id: "user_id" };
const app: Props = user; // expected error but no error
```

- Support for generics with union type

```ts
type Human<T> = { body: T; isHuman: true };
type Robot<T> = { body: T; isHuman: false; uuid: string };
type User<T> = Human<T> | Robot<T>;
const jiro = { body: { name: "jiro" }, isHuman: true, uuid: "123" } as const;
const user: User<{ name: string }> = jiro; // expected error but no error
```

- Improve performance
