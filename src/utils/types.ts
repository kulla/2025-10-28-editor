declare const brand: unique symbol
export type Branded<T, B> = T & { [brand]: B }
