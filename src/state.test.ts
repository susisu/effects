import { Action } from "./core";
import { StateEffKind, runState, get, put } from "./state";

describe("state", () => {
  describe("runState", () => {
    it("should run an action that gets / puts the state", () => {
      const action: Action<StateEffKind, number> = perform => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const x: number = perform(get);
        perform(put(x * 2));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const y: number = perform(get);
        return y;
      };
      const res1 = runState(1, action);
      expect(res1).toBe(2);
      const res2 = runState(42, action);
      expect(res2).toBe(84);
    });
  });
});
