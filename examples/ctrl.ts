import { runCtrl, split } from "../src" /* "@susisu/effects" */;

declare const console: any;

const r = runCtrl(perform => {
  const x = perform(split([1, 2]));
  const y = perform(split([1, 3]));
  return x * y;
});
console.log(r); // [1, 3, 2, 6]
