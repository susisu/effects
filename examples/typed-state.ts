import {
  Eff,
  Handlers,
  Action,
  runEff,
  CoreEffKind,
  createCoreHandlers,
} from "../src" /* "@susisu/effects" */;

type TypedStateEffKind = "typed-state/get" | "typed-state/put";

type S = number;

declare module "../src" /* "@susisu/effects" */ {
  interface Effect<A> {
    "typed-state/get": Readonly<{ t: (x: S) => A }>;
    "typed-state/put": Readonly<{ val: S; t: (x: undefined) => A }>;
  }
}

export const get: Eff<"typed-state/get", S> = {
  kind: "typed-state/get",
  t: x => x,
};

export const put = (val: S): Eff<"typed-state/put", undefined> => ({
  kind: "typed-state/put",
  val,
  t: x => x,
});

export type TypedState = { current: S };

export const createStateHandlers = <U>(state: TypedState): Handlers<TypedStateEffKind, U> => ({
  "typed-state/get": (eff, resume) => resume(eff.t(state.current)),
  "typed-state/put": (eff, resume) => {
    state.current = eff.val;
    return resume(eff.t(undefined));
  },
});

export function runTypedState<T>(init: S, action: Action<CoreEffKind | TypedStateEffKind, T>): T {
  const state = { current: init };
  const coreHandlers = createCoreHandlers<T>();
  const stateHandlers = createStateHandlers<T>(state);
  return runEff(action, x => x, {
    ...coreHandlers,
    ...stateHandlers,
  });
}

declare const console: any;

const r = runTypedState(42, perform => {
  const x = perform(get);
  perform(put(x * 2));
  const y = perform(get);
  return y;
});
console.log(r); // 84
