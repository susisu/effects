import { waitFor, runAsync } from "../src" /* "@susisu/effects" */;

declare const console: any;

const r = runAsync(perform => {
  const x = perform(waitFor(Promise.resolve(6)));
  const y = perform(waitFor(Promise.resolve(7)));
  return `The answer is ${x * y}.`;
});

r.then(res => {
  console.log(res); // "The answer is 42."
});
