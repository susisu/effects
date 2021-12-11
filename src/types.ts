export type Result<T> = Err | Ok<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Err = Readonly<{ isErr: true; err: any }>;
export type Ok<T> = Readonly<{ isErr: false; val: T }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-assignment
export const newErr = (err: any): Err => ({ isErr: true, err });
export const newOk = <T>(val: T): Ok<T> => ({ isErr: false, val });

export type Monoid<T> = Readonly<{
  empty: () => T;
  append: (x: T, y: T) => T;
}>;
