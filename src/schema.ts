import type { Iso, Key } from './types'

export function object<F extends Record<string, Schema>>(spec: {
  fields: F
  fieldOrder: Extract<keyof F, string>[]
}): ObjectSchema<F> {
  return { kind: 'object', ...spec }
}

export function union<OptionSchema extends Schema[]>(spec: {
  options: OptionSchema
  getOption(value: JSONValue<OptionSchema[number]>): OptionSchema[number]
}): UnionSchema<OptionSchema> {
  return { kind: 'union', ...spec }
}

export function array<ItemSchema extends Schema>(spec: {
  item: ItemSchema
}): ArraySchema<ItemSchema> {
  return { kind: 'array', ...spec }
}

export function wrap<C extends Schema, B>(spec: {
  wrapped: C
  wrapIso: Iso<JSONValue<C>, B>
}): WrapperSchema<C, B> {
  return { kind: 'wrapper', ...spec }
}

export function string(): StringSchema {
  return { kind: 'string' }
}

export function boolean(): BooleanSchema {
  return { kind: 'boolean' }
}

export type FlatValue<S extends Schema> = NonNullable<
  S[typeof TypeInformation]
>['FlatValue']
export type JSONValue<S extends Schema> = NonNullable<
  S[typeof TypeInformation]
>['JSONValue']

export type AllSchema =
  | ObjectSchema
  | ArraySchema
  | UnionSchema
  | WrapperSchema
  | StringSchema
  | BooleanSchema
export type SchemaKind = Schema['kind']

export interface ObjectSchema<
  F extends Record<string, Schema> = Record<string, Schema>,
> extends Schema {
  kind: 'object'
  fields: F
  fieldOrder: Extract<keyof F, string>[]
  [TypeInformation]?: {
    FlatValue: [keyof F, Key][]
    JSONValue: { [K in keyof F]: JSONValue<F[K]> }
  }
}

export interface ArraySchema<ItemSchema extends Schema = Schema>
  extends Schema {
  kind: 'array'
  item: ItemSchema
  [TypeInformation]?: {
    FlatValue: Key[]
    JSONValue: JSONValue<ItemSchema>[]
  }
}

export interface UnionSchema<OptionSchema extends Schema[] = Schema[]>
  extends Schema {
  kind: 'union'
  options: OptionSchema
  getOption(value: JSONValue<OptionSchema[number]>): OptionSchema[number]
  [TypeInformation]?: {
    FlatValue: Key
    JSONValue: JSONValue<OptionSchema[number]>
  }
}

export interface WrapperSchema<C extends Schema = Schema, B = JSONValue<C>>
  extends Schema {
  kind: 'wrapper'
  wrapped: C
  wrapIso: Iso<JSONValue<C>, B>
  [TypeInformation]?: {
    FlatValue: Key
    JSONValue: B
  }
}

export interface StringSchema extends Schema {
  kind: 'string'
  [TypeInformation]?: {
    FlatValue: string
    JSONValue: string
  }
}

export interface BooleanSchema extends Schema {
  kind: 'boolean'
  [TypeInformation]?: {
    FlatValue: boolean
    JSONValue: boolean
  }
}

export interface Schema {
  kind: string
  [TypeInformation]?: {
    FlatValue: unknown
    JSONValue: unknown
  }
}

declare const TypeInformation: unique symbol
