import type { Key } from './flat-node'

export interface Cursor<P = Point> {
  start: P
  end: P
}

export interface Point {
  key: Key
  offset?: number
}
