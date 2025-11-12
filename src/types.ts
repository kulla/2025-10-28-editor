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

export type NonEmptyArray<T> = [T, ...T[]]

export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0
}

export type Result<T> = Success<T> | Failure

interface Success<T> {
  success: true
  value: T
}

interface Failure {
  success: false
}

export function success<T>(value: T): Success<T> {
  return { success: true, value }
}

export function failure(): Failure {
  return { success: false }
}
