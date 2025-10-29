declare const brand: unique symbol
export type Branded<T, B> = T & { [brand]: B }

export interface Iso<A, B> {
  to: (a: A) => B
  from: (b: B) => A
}
