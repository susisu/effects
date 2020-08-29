import { Eff, Action, Handlers, CoreEffKind, createCoreHandlers, runEff } from "./core";
import { Result, Ok, Err } from "./types";

export type ExnEffKind = "exn/raise";

declare module "./core" {
  interface Effect<A> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "exn/raise": Readonly<{ exn: any }>;
  }
}

/**
 * `exn/raise` is an effect that raises an exception.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const raise = (exn: any): Eff<"exn/raise", never> => ({
  kind: "exn/raise",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  exn,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createExnHandlers = <U>(reject: (exn: any) => U): Handlers<ExnEffKind, U> => ({
  "exn/raise": eff => reject(eff.exn),
});

/**
 * `runExn` runs an action that may raise exceptions.
 * @param action Action to be executed.
 */
export function runExn<T>(action: Action<CoreEffKind | ExnEffKind, T>): Result<T> {
  const coreHandlers = createCoreHandlers<Result<T>>();
  const exnHandlers = createExnHandlers<Result<T>>(Err);
  return runEff(action, Ok, {
    ...coreHandlers,
    ...exnHandlers,
  });
}
