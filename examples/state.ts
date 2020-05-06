import { Action, get, put, runState } from "../src" /* "@susisu/effects" */;

const update = (f: (x: any) => any): Action<"state/get" | "state/put", void> => perform => {
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
