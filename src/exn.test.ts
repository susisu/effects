import { Action } from "./core";
import { ExnEffKind, runExn, raise } from "./exn";

describe("exn", () => {
  describe("runExn", () => {
    it("should run an action that may raise exceptions", () => {
      const action = (x: number, y: number): Action<ExnEffKind, number> => perform => {
        if (y === 0) {
          perform(raise(new Error("division by zero")));
        }
        return x / y;
      };
      const res1 = runExn(action(42, 2));
      expect(res1).toEqual({ isErr: false, val: 21 });
      const res2 = runExn(action(42, 0));
      expect(res2).toEqual({ isErr: true, err: new Error("division by zero") });
    });
  });
});
