import { Action } from "./core";
import { TryEffKind, runTry, fail } from "./try";

describe("try", () => {
  describe("runTry", () => {
    it("should run an action that may fail", () => {
      const action = (x: number, y: number): Action<TryEffKind, number> => perform => {
        if (y === 0) {
          perform(fail(new Error("division by zero")));
        }
        return x / y;
      };
      const res1 = runTry(action(42, 2));
      expect(res1).toEqual({ isErr: false, val: 21 });
      const res2 = runTry(action(42, 0));
      expect(res2).toEqual({ isErr: true, err: new Error("division by zero") });
    });
  });
});
