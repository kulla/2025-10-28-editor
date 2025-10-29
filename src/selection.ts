import type { Key } from './types'

export interface Cursor<P = Point> {
  start: P
  end: P
}

export interface Point {
  key: Key
  offset?: number
}
