import type {
  ArraySchema,
  BooleanSchema,
  ObjectSchema,
  Schema,
  StringSchema,
  UnionSchema,
  WrapperSchema,
} from './schema'

export interface NestedNode<S extends Schema> {
  schema: S
  value: JSONValue<S>
}

type JSONValue<S extends Schema> = [S] extends [unknown] ? _JSONValue<S> : never

type _JSONValue<S extends Schema> = S extends StringSchema
  ? string
  : S extends BooleanSchema
    ? boolean
    : S extends ArraySchema<infer I>
      ? _JSONValue<I>[]
      : S extends ObjectSchema
        ? { [K in keyof S['fields']]: _JSONValue<S['fields'][K]> }
        : S extends WrapperSchema<infer C>
          ? _JSONValue<C>
          : S extends UnionSchema<infer O>
            ? _JSONValue<O[number]>
            : never
