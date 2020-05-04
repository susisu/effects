import { Proc } from "./core";
import { AsyncEffKind, runAsync, await } from "./async";

describe("async", () => {
  describe("runAsync", () => {
    it("should run an asynchronous procedure", async () => {
      const proc1: Proc<AsyncEffKind, number> = perform => {
        const x = perform(await(Promise.resolve(6)));
        const y = perform(await(Promise.resolve(7)));
        return x * y;
      };
      const res1 = runAsync(proc1);
      await expect(res1).resolves.toBe(42);
      const proc2: Proc<AsyncEffKind, number> = perform => {
        const x = perform(await(Promise.resolve(6)));
        const y = perform(await(Promise.reject(new Error("unexpected failure"))));
        return x * y;
      };
      const res2 = runAsync(proc2);
      await expect(res2).rejects.toThrow(new Error("unexpected failure"));
    });
  });
});
