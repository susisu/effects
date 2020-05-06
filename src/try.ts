import { Eff, Action, Handlers, CoreEffKind, createCoreHandlers, runEff } from "./core";

export type TryEffKind = "try/fail";

declare module "./core" {
  interface Effect<A> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "try/fail": Readonly<{ err: any }>;
  }
}

/**
 * `try/fail` is an effect that fails with an error.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fail = (err: any): Eff<"try/fail", never> => ({
  kind: "try/fail",
  err,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTryHandlers = <U>(reject: (err: any) => U): Handlers<TryEffKind, U> => ({
  "try/fail": eff => reject(eff.err),
});

export type Result<T> = Err | Ok<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Err = Readonly<{ isErr: true; err: any }>;
export type Ok<T> = Readonly<{ isErr: false; val: T }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Err = (err: any): Err => ({ isErr: true, err });
export const Ok = <T>(val: T): Ok<T> => ({ isErr: false, val });

/**
 * `runTry` runs an action that may fail.
 * @param action Action to be executed.
 */
export function runTry<T>(action: Action<CoreEffKind | TryEffKind, T>): Result<T> {
  const coreHandlers = createCoreHandlers<Result<T>>();
  const tryHandlers = createTryHandlers<Result<T>>(Err);
  return runEff(action, Ok, {
    ...coreHandlers,
    ...tryHandlers,
  });
}
