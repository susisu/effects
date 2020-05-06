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
export interface Effect<A> {}
export type EffKind = keyof Effect<unknown>;
export type Eff<K extends EffKind, A> = K extends unknown
  ? Readonly<{ kind: K }> & Effect<A>[K]
  : never;

export type Perform<K extends EffKind> = <A>(eff: Eff<K, A> | Action<K, A>) => A;
export type Action<K extends EffKind, T> = (perform: Perform<K>) => T;
export type Handler<K extends EffKind, U> = <A>(
  eff: Eff<K, A>,
  next: (val: A) => U,
  fork: (val: A) => U
) => U;
export type Handlers<K extends EffKind, U> = Readonly<{ [K0 in K]: Handler<K0, U> }>;

function runEff_<K extends EffKind, T, U>(
  action: Action<K, T>,
  cont: (val: T) => U,
  handlers: Handlers<K, U>,
  vals: unknown[]
): U {
  const [loop, next, fork] = [
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
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw { key, eff };
        };
        return cont(action(perform));
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!err || err.key !== key) {
          throw err;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const eff = err.eff as Eff<K, unknown>;
        return handlers[eff.kind as K](eff, next, fork);
      }
    },
    (val: unknown): U => {
      vals.push(val);
      return loop();
    },
    (val: unknown): U => {
      return runEff_(action, cont, handlers, vals.concat([val]));
    },
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
 * @param cont Continuation that will be called when the action finishes.
 * @param handlers Effect handlers that handle effects performed by the action.
 * A handler takes two arguments: the performed effect and the continuation.
 */
export function runEff<K extends EffKind, T, U>(
  action: Action<K, T>,
  cont: (val: T) => U,
  handlers: Handlers<K, U>
): U {
  return runEff_(action, cont, handlers, []);
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
  "core/compute": (eff, next) => next(eff.func.call(undefined)),
});
