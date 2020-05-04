import { Proc } from "../src"; // "@susisu/effects";
import { get, put, runState } from "../src/state"; // "@susisu/effects/state";

const update = (f: (x: any) => any): Proc<"state/get" | "state/put", void> => perform => {
  const x = perform(get);
  perform(put(f(x)));
};

declare const console: any;

const r = runState(42, perform => {
  const x = perform(get);
  perform(put(x * 2));
  perform(update(x => x + 1));
  const y = perform(get);
  return y;
});
console.log(r); // 85
