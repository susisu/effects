import { Action } from "./core";
import { AsyncEffKind, runAsync, waitFor } from "./async";

describe("async", () => {
  describe("runAsync", () => {
    it("should run an asynchronous action", async () => {
      const action1: Action<AsyncEffKind, number> = perform => {
        const x = perform(waitFor(Promise.resolve(6)));
        const y = perform(waitFor(Promise.resolve(7)));
        return x * y;
      };
      const res1 = runAsync(action1);
      await expect(res1).resolves.toBe(42);

      const action2: Action<AsyncEffKind, number> = perform => {
        const x = perform(waitFor(Promise.resolve(6)));
        const y = perform(waitFor(Promise.reject(new Error("unexpected failure"))));
        return x * y;
      };
      const res2 = runAsync(action2);
      await expect(res2).rejects.toThrow(new Error("unexpected failure"));
    });
  });
});
