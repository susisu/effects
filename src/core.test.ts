import { CoreEffKind, Action, runEff, compute, createCoreHandlers } from "./core";

describe("core", () => {
  describe("runEff", () => {
    it("should run an action that may perform effects", () => {
      const f = jest.fn(() => 6);
      const g = jest.fn(() => 7);
      const action: Action<CoreEffKind, number> = perform => {
        const x = perform(compute(f));
        const y = perform(compute(g));
        return x * y;
      };
      const handlers = createCoreHandlers<string>();
      const res = runEff(action, x => `The answer is ${x}.`, handlers);
      expect(res).toBe("The answer is 42.");
      expect(f).toHaveBeenCalledTimes(1);
      expect(g).toHaveBeenCalledTimes(1);
    });

    it("should be able to perform another action", () => {
      const f = jest.fn(() => 6);
      const g = jest.fn(() => 7);
      const action1: Action<CoreEffKind, number> = perform => {
        const x = perform(compute(f));
        const y = perform(compute(g));
        return x * y;
      };
      const action2: Action<CoreEffKind, string> = perform => {
        const x = perform(action1);
        const y = perform(action1);
        return `The answer is ${x}. It is always ${y}.`;
      };
      const handlers = createCoreHandlers<string>();
      const res = runEff(action2, x => x, handlers);
      expect(res).toBe("The answer is 42. It is always 42.");
      expect(f).toHaveBeenCalledTimes(2);
      expect(g).toHaveBeenCalledTimes(2);
    });

    it("should rethrow non-effect errors", () => {
      const action: Action<CoreEffKind, number> = () => {
        throw new Error("unexpected failure");
      };
      const handlers = createCoreHandlers<string>();
      expect(() => runEff(action, x => `The answer is ${x}.`, handlers)).toThrow(
        new Error("unexpected failure")
      );
    });
  });
});
