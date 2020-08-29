import { Eff, Action, Handlers, CoreEffKind, createCoreHandlers, runEff } from "./core";

export type AsyncEffKind = "async/wait";

declare module "./core" {
  interface Effect<A> {
    "async/wait": Readonly<{ promise: Promise<A> }>;
  }
}

/**
 * `async/wait` is an effect that awaits promise to be fulfilled.
 */
export const wait = <A>(promise: Promise<A>): Eff<"async/wait", A> => ({
  kind: "async/wait",
  promise,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAsyncHandlers = (reject: (err: any) => void): Handlers<AsyncEffKind, void> => ({
  "async/wait": (eff, resume) => eff.promise.then(resume, reject),
});

/**
 * `runAsync` runs an asyncrhoous action.
 * @param action Action to be executed.
 */
export function runAsync<T>(action: Action<CoreEffKind | AsyncEffKind, T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const coreHandlers = createCoreHandlers<void>();
    const asyncHandlers = createAsyncHandlers(reject);
    return runEff(action, resolve, {
      ...coreHandlers,
      ...asyncHandlers,
    });
  });
}
