import type { AllSchema, FlatValue, Schema, SchemaKind } from './schema'
import type { Key } from './types'

export interface FlatNode<S extends Schema = Schema> {
  schema: S
  key: Key
  parentKey: Key | null
  value: FlatValue<S>
}

export function isKind<K extends SchemaKind>(
  kind: K,
  node: FlatNode,
): node is FlatNode<Extract<AllSchema, { kind: K }>> {
  return node.schema.kind === kind
}
