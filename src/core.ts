/**
 * `Effect<A>` collects all effect kinds that can be performed.
 *
 * Since TypeScript does not support higher-kinded types, types like `E<A>` where `E` is a type
 * parameter cannot be declared.
 * So `Effect<A>[K]` where `K` is a type parameter is used instead.
 * `Eff<K, A>` is an alias of this.
 *
 * Interfaces are "open" in TypeScript, and thus can be extended to define new effect kinds.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Effect<A> {}
export type EffKind = keyof Effect<unknown>;
export type Eff<K extends EffKind, A> = K extends unknown
  ? Readonly<{ kind: K }> & Effect<A>[K]
  : never;

export type Perform<K extends EffKind> = <A>(eff: Eff<K, A> | Action<K, A>) => A;
export type Action<K extends EffKind, T> = (perform: Perform<K>) => T;
export type Handler<K extends EffKind, U> = <A>(
  eff: Eff<K, A>,
  resume: (val: A) => U,
  fork: (val: A) => U
) => U;
export type Handlers<K extends EffKind, U> = Readonly<{ [K0 in K]: Handler<K0, U> }>;

type Yield<K extends EffKind, A> = Readonly<{ key: symbol; eff: Eff<K, A> }>;

function isYeid<K extends EffKind>(obj: unknown, key: symbol): obj is Yield<K, unknown> {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  const o = obj as Readonly<{ key?: unknown }>;
  return o.key === key;
}

function runEff_<K extends EffKind, T, U>(
  action: Action<K, T>,
  ret: (val: T) => U,
  handlers: Handlers<K, U>,
  vals: unknown[]
): U {
  const [loop, resume, fork] = [
    (): U => {
      const key = Symbol();
      try {
        let i: number = 0;
        const perform = <A>(eff: Eff<K, A> | Action<K, A>): A => {
          if (typeof eff === "function") {
            return eff(perform);
          }
          if (i < vals.length) {
            const val = vals[i] as A;
            i += 1;
            return val;
          }
          const y: Yield<K, A> = { key, eff };
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw y;
        };
        return ret(action(perform));
      } catch (err: unknown) {
        if (!isYeid<K>(err, key)) {
          throw err;
        }
        const eff = err.eff;
        return handlers[eff.kind as K](eff, resume, fork);
      }
    },
    (val: unknown): U => {
      vals.push(val);
      return loop();
    },
    (val: unknown): U => runEff_(action, ret, handlers, vals.concat([val])),
  ];
  return loop();
}

/**
 * `runEff` runs actions that may perform effects.
 * @param action Action to be executed.
 * Note that this function may be executed more than once, and must perform the same effects in the
 * same order every time.
 * In other words, the function must be pure except that it may be interrupted by performing
 * effects.
 * @param ret Handler that handles values returned by the action.
 * @param handlers Handlers that handle effects performed by the action.
 * A handler takes three arguments:
 * - Effect that is performed by the action
 * - Resume function that resumes the action. This function can be called only once.
 * - Fork function that also resumes the action, but can be called multiple times, in exchange for
 *   performance. Either resume or fork can be used in a handler.
 */
export function runEff<K extends EffKind, T, U>(
  action: Action<K, T>,
  ret: (val: T) => U,
  handlers: Handlers<K, U>
): U {
  return runEff_(action, ret, handlers, []);
}

export type CoreEffKind = "core/compute";

export interface Effect<A> {
  "core/compute": Readonly<{ func: () => A }>;
}

/**
 * `core/compute` is an effect that computes a function.
 * Typical use cases of this effect is:
 * - computing a function that may cause side-effects
 * - memoizing the result of a time-consuming computation
 */
export const compute = <A>(func: () => A): Eff<"core/compute", A> => ({
  kind: "core/compute",
  func,
});

export const createCoreHandlers = <U>(): Handlers<CoreEffKind, U> => ({
  "core/compute": (eff, resume) => resume(eff.func.call(undefined)),
});
