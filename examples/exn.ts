import { Action, raise, runExn } from "../src" /* "@susisu/effects" */;

const parse =
  (str: string): Action<"exn/raise", number> =>
  perform => {
    const num = parseFloat(str);
    if (Number.isNaN(num)) {
      return perform(raise(new Error(`failed to parse: ${str}`)));
    }
    return num;
  };

const divide =
  (x: number, y: number): Action<"exn/raise", number> =>
  perform => {
    if (y === 0) {
      return perform(raise(new Error("division by zero")));
    }
    return x / y;
  };

declare const console: any;

const r1 = runExn(perform => {
  const x = perform(parse("42"));
  const y = perform(parse("2"));
  const q = perform(divide(x, y));
  return q;
});
console.log(r1); // { isErr: false, val: 21 }

const r2 = runExn(perform => {
  const x = perform(parse("42"));
  const y = perform(parse("0"));
  const q = perform(divide(x, y));
  return q;
});
console.log(r2); // { isErr: true, err: Error("division by zero") }
