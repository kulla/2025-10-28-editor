import type { FlatNode } from './flat-node'
import type { EditorStore } from './store'
import type { Iso, Key } from './types'
import type { NodePath } from './index-path'

export function object<F extends Record<string, Schema>>(spec: {
  fields: F
  fieldOrder: Extract<keyof F, string>[]
  htmlTag?: React.HTMLElementType
  render?(args: {
    node: FlatNode<ObjectSchema<F>>
    store: EditorStore
    nodePath: NodePath
    className?: string
  }): React.ReactNode
}): ObjectSchema<F> {
  return { kind: 'object', ...spec, htmlTag: spec.htmlTag ?? 'div' }
}

export function union<OptionSchema extends Schema[]>(spec: {
  options: OptionSchema
  getOption(value: JSONValue<OptionSchema[number]>): OptionSchema[number]
  htmlTag?: React.HTMLElementType
}): UnionSchema<OptionSchema> {
  return { kind: 'union', ...spec }
}

export function array<ItemSchema extends Schema>(spec: {
  item: ItemSchema
  htmlTag?: React.HTMLElementType
}): ArraySchema<ItemSchema> {
  return { kind: 'array', ...spec }
}

export function wrap<C extends Schema, B>(spec: {
  wrapped: C
  wrapIso: Iso<JSONValue<C>, B>
  htmlTag?: React.HTMLElementType
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
  htmlTag: React.HTMLElementType
  [TypeInformation]?: {
    FlatValue: { [K in keyof F]: Key }
    JSONValue: { [K in keyof F]: JSONValue<F[K]> }
  }
}

export interface ArraySchema<ItemSchema extends Schema = Schema>
  extends Schema {
  kind: 'array'
  item: ItemSchema
  htmlTag?: React.HTMLElementType
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
  htmlTag?: React.HTMLElementType
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
  htmlTag?: React.HTMLElementType
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
  render?(args: {
    node: FlatNode
    store: EditorStore
    nodePath: NodePath
    className?: string
  }): React.ReactNode
}

declare const TypeInformation: unique symbol
