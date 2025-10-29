import type { Iso, Key } from './utils/types'

export function object<F extends Record<string, BaseSchema>>(spec: {
  fields: F
  fieldOrder: Extract<keyof F, string>[]
}): ObjectSchema<F> {
  return { kind: 'object', ...spec }
}

export function union<OptionSchema extends BaseSchema[]>(spec: {
  options: OptionSchema
  getOption(value: JSONValue<OptionSchema[number]>): OptionSchema[number]
}): UnionSchema<OptionSchema> {
  return { kind: 'union', ...spec }
}

export function array<ItemSchema extends BaseSchema>(spec: {
  item: ItemSchema
}): ArraySchema<ItemSchema> {
  return { kind: 'array', ...spec }
}

export function wrap<C extends BaseSchema, B>(spec: {
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

export type FlatValue<S extends BaseSchema> = NonNullable<
  S[typeof TypeInformation]
>['FlatValue']
export type JSONValue<S extends BaseSchema> = NonNullable<
  S[typeof TypeInformation]
>['JSONValue']

export interface ObjectSchema<
  F extends Record<string, BaseSchema> = Record<string, BaseSchema>,
> extends BaseSchema {
  kind: 'object'
  fields: F
  fieldOrder: Extract<keyof F, string>[]
  [TypeInformation]?: {
    FlatValue: { [K in keyof F]: Key }
    JSONValue: { [K in keyof F]: JSONValue<F[K]> }
  }
}

export interface ArraySchema<ItemSchema extends BaseSchema = BaseSchema>
  extends BaseSchema {
  kind: 'array'
  item: ItemSchema
  [TypeInformation]?: {
    FlatValue: Key[]
    JSONValue: JSONValue<ItemSchema>[]
  }
}

export interface UnionSchema<OptionSchema extends BaseSchema[] = BaseSchema[]>
  extends BaseSchema {
  kind: 'union'
  options: OptionSchema
  getOption(value: JSONValue<OptionSchema[number]>): OptionSchema[number]
  [TypeInformation]?: {
    FlatValue: Key
    JSONValue: JSONValue<OptionSchema[number]>
  }
}

export interface WrapperSchema<
  C extends BaseSchema = BaseSchema,
  B = JSONValue<C>,
> extends BaseSchema {
  kind: 'wrapper'
  wrapped: C
  wrapIso: Iso<JSONValue<C>, B>
  [TypeInformation]?: {
    FlatValue: Key
    JSONValue: B
  }
}

export interface StringSchema extends BaseSchema {
  kind: 'string'
  [TypeInformation]?: {
    FlatValue: string
    JSONValue: string
  }
}

export interface BooleanSchema extends BaseSchema {
  kind: 'boolean'
  [TypeInformation]?: {
    FlatValue: boolean
    JSONValue: boolean
  }
}

interface BaseSchema {
  [TypeInformation]?: {
    FlatValue: unknown
    JSONValue: unknown
  }
}

declare const TypeInformation: unique symbol
