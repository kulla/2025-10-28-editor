export function schema<S extends Schema>(schema: S): S {
  return schema
}

type Schema =
  | ObjectSchema
  | ArraySchema
  | StringSchema
  | BooleanSchema
  | WrapperSchema
  | UnionSchema

interface ObjectSchema<
  F extends Record<string, Schema> = Record<string, Schema>,
> {
  kind: 'object'
  fields: F
}

interface ArraySchema<I extends Schema = Schema> {
  kind: 'array'
  item: I
}

interface UnionSchema<O extends Schema[] = Schema[]> {
  kind: 'union'
  options: O
}

interface WrapperSchema<C extends Schema = Schema> {
  kind: 'wrapper'
  child: C
  isRoot?: true
}

interface StringSchema {
  kind: 'string'
}

interface BooleanSchema {
  kind: 'boolean'
}
