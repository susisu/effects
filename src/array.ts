import { Eff, Action, Handlers, CoreEffKind, createCoreHandlers, runEff } from "./core";

export type ArrayEffKind = "array/split";

declare module "./core" {
  interface Effect<A> {
    "array/split": Readonly<{ arr: readonly A[] }>;
  }
}

/**
 * `array/split` is an effect that splits the current execution.
 */
export const split = <A>(arr: readonly A[]): Eff<"array/split", A> => ({
  kind: "array/split",
  arr,
});

export type Monoid<T> = Readonly<{
  empty: () => T;
  append: (x: T, y: T) => T;
}>;

export const createArrayHandlers = <U>(m: Monoid<U>): Handlers<ArrayEffKind, U> => {
  return {
    "array/split": (eff, _, fork) =>
      eff.arr.map(fork).reduce((xs, ys) => m.append(xs, ys), m.empty()),
  };
};

export const arrayMonoid = <T>(): Monoid<T[]> => ({
  empty: () => [],
  append: (x, y) => x.concat(y),
});

/**
 * `runArray` runs an action whose execution can be splitted.
 * @param action Action to be executed.
 */
export function runArray<T>(action: Action<CoreEffKind | ArrayEffKind, T>): T[] {
  const coreHandlers = createCoreHandlers<T[]>();
  const arrayHandlers = createArrayHandlers(arrayMonoid<T>());
  return runEff(action, x => [x], {
    ...coreHandlers,
    ...arrayHandlers,
  });
}
