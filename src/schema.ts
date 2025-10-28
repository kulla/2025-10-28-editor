export const object = <F extends Record<string, Schema>>(
  fields: F,
): ObjectSchema<F> => ({ kind: 'object', fields })

export const array = <I extends Schema>(element: I): ArraySchema<I> => ({
  kind: 'array',
  item: element,
})

export const union = <O extends Schema[]>(...options: O): UnionSchema<O> => ({
  kind: 'union',
  options,
})

export const wrapper = <C extends Schema>(
  spec: Omit<WrapperSchema<C>, 'kind'>,
): WrapperSchema<C> => ({
  kind: 'wrapper',
  ...spec,
})

export const string = (): StringSchema => ({ kind: 'string' })
export const boolean = (): BooleanSchema => ({ kind: 'boolean' })

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
