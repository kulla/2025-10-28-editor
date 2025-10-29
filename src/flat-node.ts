import type { FlatValue, Schema } from './schema'
import type { Key } from './types'

export interface FlatNode<S extends Schema = Schema> {
  schema: S
  key: Key
  parentKey: Key | null
  value: FlatValue<S>
}
