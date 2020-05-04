import { Proc } from "../src"; // "@susisu/effects";
import { fail, runTry } from "../src/try"; // "@susisu/effects/try";

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

declare const console: any;

const r1 = runTry(perform => {
  const x = perform(parse("42"));
  const y = perform(parse("2"));
  const q = perform(divide(x, y));
  return q;
});
console.log(r1); // { isErr: false, val: 21 }

const r2 = runTry(perform => {
  const x = perform(parse("42"));
  const y = perform(parse("0"));
  const q = perform(divide(x, y));
  return q;
});
console.log(r2); // { isErr: true, err: Error("division by zero") }
