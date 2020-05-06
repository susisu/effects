import { Eff, Action, Handlers, CoreEffKind, createCoreHandlers, runEff } from "./core";
import { Monoid } from "./types";

export type CtrlEffKind = "ctrl/abort" | "ctrl/split";

declare module "./core" {
  interface Effect<A> {
    "ctrl/abort": Readonly<{ t: (x: never) => A }>;
    "ctrl/split": Readonly<{ arr: readonly A[] }>;
  }
}

/**
 * `ctrl/abort` is an effect that aborts the current execution.
 */
export const abort: Eff<"ctrl/abort", never> = {
  kind: "ctrl/abort",
  t: x => x,
};

/**
 * `ctrl/split` is an effect that splits the current execution.
 */
export const split = <A>(arr: readonly A[]): Eff<"ctrl/split", A> => ({
  kind: "ctrl/split",
  arr,
});

export const createCtrlHandlers = <U>(m: Monoid<U>): Handlers<CtrlEffKind, U> => {
  return {
    "ctrl/abort": () => m.empty(),
    "ctrl/split": (eff, _, fork) =>
      eff.arr.map(fork).reduce((xs, ys) => m.append(xs, ys), m.empty()),
  };
};

export const arrayMonoid = <T>(): Monoid<T[]> => ({
  empty: () => [],
  append: (x, y) => x.concat(y),
});

/**
 * `runCtrl` runs an action whose execution flow can be controled.
 * @param action Action to be executed.
 */
export function runCtrl<T>(action: Action<CoreEffKind | CtrlEffKind, T>): T[] {
  const coreHandlers = createCoreHandlers<T[]>();
  const ctrlHandlers = createCtrlHandlers(arrayMonoid<T>());
  return runEff(action, x => [x], {
    ...coreHandlers,
    ...ctrlHandlers,
  });
}
