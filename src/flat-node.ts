import type {
  ArraySchema,
  BooleanSchema,
  ObjectSchema,
  Schema,
  StringSchema,
  UnionSchema,
  WrapperSchema,
} from './schema'
import type { Branded } from './utils/types'

export interface FlatNode<S extends Schema> {
  schema: S
  value: FlatValue<S>
}

export type FlatValue<S extends Schema> = S extends StringSchema
  ? string
  : S extends BooleanSchema
    ? boolean
    : S extends ArraySchema
      ? Key[]
      : S extends ObjectSchema
        ? { [K in keyof S['fields']]: Key }
        : S extends WrapperSchema
          ? Key
          : S extends UnionSchema
            ? Key
            : never

export type Key = Branded<string, 'Key'>
