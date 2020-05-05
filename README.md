# effec*ts*

[![Build Status](https://travis-ci.com/susisu/effects.svg?branch=master)](https://travis-ci.com/susisu/effects)

Poor man's effect system for TypeScript

**NOTE: This is an experimental package and not suitable for production use.**

``` shell
npm i @susisu/effects
# or
yarn add @susisu/effects
```

## Motivation
Imagine translating "Either" monad in Haskell or Scala into TypeScript, for example.

In TypeScript, there is no do- or for-comprehension available in Haskell and Scala, so basically you need to write callbacks (continuations) explicitly to write monadic programs.

``` typescript
const parse = (str: string): Either<Error, number> => {
  const num = parseFloat(str);
  if (Number.isNaN(num)) {
    return left(new Error(`failed to parse: ${str}`));
  }
  return right(num);
};

const divide = (x: number, y: number): Either<Error, number> => {
  if (y === 0) {
    return left(new Error("division by zero"));
  }
  return right(x / y);
};

const r1 = parse("42").bind(x =>
  parse("2").bind(y =>
    divide(x, y)
  )
);
// r1 = Right(21)

const r2 = parse("42").bind(x =>
  parse("0").bind(y =>
    divide(x, y)
  )
);
// r2 = Left(Error("division by zero"))
```

This is relatively simple example and you may not feel it is bad, but when the code becomes larger and more complex, the *callback hell* emerges.

You may notice that this is like Promises before async/await. Yes, it is the same problem.

``` typescript
readFile("file1.txt").then(x =>
  readFile("file2.txt").then(y =>
    writeFile("file3.txt", x + y)
  )
);
```

Generators (coroutines) can help to solve this kind of problem. You can define a special function `_do` that deals with generators, and the same logic can be written in a more flat and readable way.

``` typescript
const r1 = _do(function* () {
  const x = yield parse("42");
  const y = yield parse("2");
  const q = yield divide(x, y);
  return q;
});
```

There was a library named [co](https://www.npmjs.com/package/co) that does the same thing for Promises.

However, the solution using generators can not be typed well. In the above example, all of `x`, `y`, and `q` are of type `any` unless you write type annotations explicitly.

Fortunately, async/await are typed well, because it is a built-in feature of the language.

``` typescript
const x = await readFile("file1.txt");
const y = await readFile("file2.txt");
await writeFile("file3.txt", x + y);
```

But async/await is only for Promises, and any other monads cannot enjoy this.

effec*ts* tries to address this issue by providing an "alternative" to generators along with a framework of effect system, allows you to write your logic in a flat and type-safe way.

``` typescript
const r1 = runTry(perform => {
  const x = perform(parse("42"));
  const y = perform(parse("2"));
  const q = perform(divide(x, y));
  return q;
});
```

## What is this?
effec*ts* provides poor man's effect system for TypeScript.

- It allows you to write procedures that may perform some effects (side-effects, interruptions, reading and updateing state, async/await, etc.) in a concise way.
- It can be typed, in contrast to the solution using generators.
- It provides "open" definition of effects, which means you can define your own effects.

## Examples
The full code of the example in the previous section is the following:

``` typescript
import { Proc, fail, runTry } from "@susisu/effects";
 
const parse = (str: string): Proc<"try/fail", number> => perform => {
  const num = parseFloat(str);
  if (Number.isNaN(num)) {
    return perform(fail(new Error(`failed to parse: ${str}`)));
  }
  return num;
};

const divide = (x: number, y: number): Proc<"try/fail", number> => perform => {
  if (y === 0) {
    return perform(fail(new Error("division by zero")));
  }
  return x / y;
};

const r1 = runTry(perform => {
  const x = perform(parse("42"));
  const y = perform(parse("2"));
  const q = perform(divide(x, y));
  return q;
});
// r1 = { isErr: false, val: 21 }

const r2 = runTry(perform => {
  const x = perform(parse("42"));
  const y = perform(parse("0"));
  const q = perform(divide(x, y));
  return q;
});
// r2 = { isErr: true, err: Error("division by zero") }
```

You can find more examples in the `examples/` directory.

## How does it work?
Why generators (coroutines) can be used to flatten monadic codes is that, they can be paused and resumed, that is, continuations at any point of function can be obtained.

So how we can obtain continuations at any point of a usual function? The answer is, we cannot, but we don't need. The key idea is that a function should perform completely the same when called multiple times if it is pure.

When `perform` is called with an effect for the first time in a procedure, it throws the effect to exit the function. The thrown effect is caught by `runEff`, and it passes the effect to the corresponding handler, updates its internal state using the value received from the handler, and executes the procedure the again. At the second (or third, ...) call, `perform` just returns the value received from the handler, and proceeds to the next.

An effect handler can also stop the procedure by not calling the continuation, and `runEff` exits then.

## Limitations
There are (currently) some technical limitations:

- The kind of effects are simply string literal types, and can not take type arguments.

## Acknowledgement
- The idea at the core is very similar to [React Hooks](https://reactjs.org/docs/react-api.html#hooks) and [Suspense](https://reactjs.org/docs/react-api.html#suspense), and is inspired some by them and [this article about algebraic effects](https://overreacted.io/algebraic-effects-for-the-rest-of-us/).
- I also borrowed the idea from [fp-ts](https://github.com/gcanti/fp-ts) to define effect as a higher-kinded type using `interface`.

## License

[MIT License](http://opensource.org/licenses/mit-license.php)

## Author

Susisu ([GitHub](https://github.com/susisu), [Twitter](https://twitter.com/susisu2413))
