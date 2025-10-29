export type Key = Branded<string, 'Key'>

export function isKey(value: unknown): value is Key {
  return typeof value === 'string'
}

declare const brand: unique symbol
export type Branded<T, B> = T & { [brand]: B }

export interface Iso<A, B> {
  to: (a: A) => B
  from: (b: B) => A
}
