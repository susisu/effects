export type Result<T> = Err | Ok<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Err = Readonly<{ isErr: true; err: any }>;
export type Ok<T> = Readonly<{ isErr: false; val: T }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Err = (err: any): Err => ({ isErr: true, err });
export const Ok = <T>(val: T): Ok<T> => ({ isErr: false, val });

export type Monoid<T> = Readonly<{
  empty: () => T;
  append: (x: T, y: T) => T;
}>;
