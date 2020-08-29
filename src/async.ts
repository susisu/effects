import { Eff, Action, Handlers, CoreEffKind, createCoreHandlers, runEff } from "./core";

export type AsyncEffKind = "async/waitFor";

declare module "./core" {
  interface Effect<A> {
    "async/waitFor": Readonly<{ promise: Promise<A> }>;
  }
}

/**
 * `async/waitFor` is an effect that awaits promise to be fulfilled.
 */
export const waitFor = <A>(promise: Promise<A>): Eff<"async/waitFor", A> => ({
  kind: "async/waitFor",
  promise,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAsyncHandlers = (reject: (err: any) => void): Handlers<AsyncEffKind, void> => ({
  "async/waitFor": (eff, resume) => eff.promise.then(resume, reject),
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
