import { Proc } from "./core";
import { StateEffKind, runState, get, put } from "./state";

describe("state", () => {
  describe("runState", () => {
    it("should run a procedure that gets / puts the state", () => {
      const proc: Proc<StateEffKind, number> = perform => {
        const x: number = perform(get);
        perform(put(x * 2));
        const y: number = perform(get);
        return y;
      };
      const res1 = runState(1, proc);
      expect(res1).toBe(2);
      const res2 = runState(42, proc);
      expect(res2).toBe(84);
    });
  });
});
