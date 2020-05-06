import { Eff, Action, Handlers, CoreEffKind, createCoreHandlers, runEff } from "./core";

export type StateEffKind = "state/get" | "state/put";

declare module "./core" {
  interface Effect<A> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "state/get": Readonly<{ t: (x: any) => A }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "state/put": Readonly<{ val: any; t: (x: undefined) => A }>;
  }
}

/**
 * `state/get` is an effect that gets the current state.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get: Eff<"state/get", any> = {
  kind: "state/get",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  t: x => x,
};

/**
 * `state/put` is an effect that puts a value to the state.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const put = (val: any): Eff<"state/put", undefined> => ({
  kind: "state/put",
  val,
  t: x => x,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type State = { current: any };

export const createStateHandlers = <U>(state: State): Handlers<StateEffKind, U> => {
  return {
    "state/get": (eff, resume) => resume(eff.t(state.current)),
    "state/put": (eff, resume) => {
      state.current = eff.val;
      return resume(eff.t(undefined));
    },
  };
};

/**
 * `runState` runs an action with a state.
 * @param init Initial state.
 * @param action Action to be executed.
 */
export function runState<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init: any,
  action: Action<CoreEffKind | StateEffKind, T>
): T {
  const state = { current: init };
  const coreHandlers = createCoreHandlers<T>();
  const stateHandlers = createStateHandlers<T>(state);
  return runEff(action, x => x, {
    ...coreHandlers,
    ...stateHandlers,
  });
}
