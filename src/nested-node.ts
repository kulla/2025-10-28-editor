import type {
  ArraySchema,
  BooleanSchema,
  ObjectSchema,
  Schema,
  SchemaKind,
  StringSchema,
  UnionSchema,
  WrapperSchema,
} from './schema'

export interface NestedNode<S extends Schema = Schema> {
  schema: S
  value: JSONValue<S>
}

export function getProperty<
  F extends Record<string, Schema>,
  K extends keyof F,
>(node: NestedNode<ObjectSchema<F>>, key: K): NestedNode<F[K]> {
  return {
    schema: node.schema.fields[key],
    value: node.value[key],
  }
}

export function mapObjectProperties<F extends Record<string, Schema>, T>(
  node: NestedNode<ObjectSchema<F>>,
  fn: <K extends keyof F>(propertyNode: NestedNode<F[K]>, key: K) => T,
): T[] {
  return node.schema.fieldOrder.map((key) => fn(getProperty(node, key), key))
}

export function mapArrayItems<I extends Schema, T>(
  node: NestedNode<ArraySchema<I>>,
  fn: (item: NestedNode<I>, index: number) => T,
): T[] {
  return getChildren(node).map(fn)
}

export function getChildren<I extends Schema>(
  node: NestedNode<ArraySchema<I>>,
): NestedNode<I>[] {
  return node.value.map((itemValue) => ({
    schema: node.schema.item,
    value: itemValue,
  }))
}

export function getWrapperChild<C extends Schema>({
  schema: { child },
  value,
}: NestedNode<WrapperSchema<C>>): NestedNode<C> {
  return { schema: child, value: value as JSONValue<C> }
}

export function getUnionOption<O extends Schema>({
  schema: { getOption },
  value,
}: NestedNode<UnionSchema<O[]>>): NestedNode<O> {
  return { schema: getOption(value), value }
}

export function isKind<K extends SchemaKind>(
  kind: K,
  node: NestedNode,
): node is NestedNode<Extract<Schema, { kind: K }>> {
  return node.schema.kind === kind
}

export type JSONValue<S extends Schema, D extends number = 10> = [D] extends [
  never,
]
  ? never
  : S extends StringSchema
    ? string
    : S extends BooleanSchema
      ? boolean
      : S extends ArraySchema<infer I>
        ? JSONValue<I, Prev[D]>[]
        : S extends ObjectSchema
          ? { [K in keyof S['fields']]: JSONValue<S['fields'][K], Prev[D]> }
          : S extends WrapperSchema
            ? JSONValue<S['child'], Prev[D]>
            : S extends UnionSchema<infer O>
              ? JSONValue<O[number], Prev[D]>
              : never

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
