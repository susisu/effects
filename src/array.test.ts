import { Proc } from "./core";
import { ArrayEffKind, runArray, split } from "./array";

describe("array", () => {
  describe("runArray", () => {
    it("should run a procedure that can split", () => {
      const proc1: Proc<ArrayEffKind, number> = perform => {
        const x = perform(split([1, 2]));
        const y = perform(split([1, 3]));
        return x * y;
      };
      const res1 = runArray(proc1);
      expect(res1).toEqual([1, 3, 2, 6]);

      const proc2: Proc<ArrayEffKind, number> = perform => {
        const x = perform(split([1, 2]));
        const y = perform(split([]));
        return x * y;
      };
      const res2 = runArray(proc2);
      expect(res2).toEqual([]);
    });
  });
});
