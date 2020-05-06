import { Action, CoreEffKind, compute } from "./core";
import { CtrlEffKind, runCtrl, abort, split } from "./ctrl";

describe("ctrl", () => {
  describe("runCtrl", () => {
    it("should run an action that can be aborted", () => {
      const f = jest.fn();
      const g = jest.fn();
      const action: Action<CtrlEffKind | CoreEffKind, void> = perform => {
        perform(compute(f));
        perform(abort);
        perform(compute(g));
      };
      const res = runCtrl(action);
      expect(res).toEqual([]);
      expect(f).toHaveBeenCalledTimes(1);
      expect(g).toHaveBeenCalledTimes(0);
    });

    it("should run an action that can be splitted", () => {
      const f = jest.fn();
      const g = jest.fn();
      const action1: Action<CtrlEffKind | CoreEffKind, number> = perform => {
        const x = perform(split([1, 2]));
        perform(compute(f));
        const y = perform(split([1, 3]));
        perform(compute(g));
        return x * y;
      };
      const res1 = runCtrl(action1);
      expect(res1).toEqual([1, 3, 2, 6]);
      expect(f).toHaveBeenCalledTimes(2);
      expect(g).toHaveBeenCalledTimes(4);

      const action2: Action<CtrlEffKind, number> = perform => {
        const x = perform(split([1, 2]));
        const y = perform(split<number>([]));
        return x * y;
      };
      const res2 = runCtrl(action2);
      expect(res2).toEqual([]);
    });
  });
});
