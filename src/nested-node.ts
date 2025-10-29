import type {
  AllSchema,
  ArraySchema,
  JSONValue,
  ObjectSchema,
  Schema,
  SchemaKind,
  UnionSchema,
  WrapperSchema,
} from './schema'

export interface NestedNode<S extends Schema = Schema> {
  schema: S
  value: JSONValue<S>
}

export function create<S extends Schema>(
  schema: S,
  value: JSONValue<S>,
): NestedNode<S> {
  return { schema, value }
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

export function getWrappedChild<C extends Schema>({
  schema: { wrapped, wrapIso },
  value,
}: NestedNode<WrapperSchema<C>>): NestedNode<C> {
  return { schema: wrapped, value: wrapIso.from(value) }
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
): node is NestedNode<Extract<AllSchema, { kind: K }>> {
  return node.schema.kind === kind
}
