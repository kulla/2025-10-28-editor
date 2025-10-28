export function schema<S extends Schema>(schema: S): S {
  return schema
}

export type Schema =
  | ObjectSchema
  | ArraySchema
  | StringSchema
  | BooleanSchema
  | WrapperSchema
  | UnionSchema

export interface ObjectSchema<
  F extends Record<string, Schema> = Record<string, Schema>,
> {
  kind: 'object'
  fields: F
}

export interface ArraySchema<I extends Schema = Schema> {
  kind: 'array'
  item: I
}

export interface UnionSchema<O extends Schema[] = Schema[]> {
  kind: 'union'
  options: O
}

export interface WrapperSchema<C extends Schema = Schema> {
  kind: 'wrapper'
  child: C
  isRoot?: true
}

export interface StringSchema {
  kind: 'string'
}

export interface BooleanSchema {
  kind: 'boolean'
}
