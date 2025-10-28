export const object = <F extends Record<string, Schema>>(
  properties: F,
): ObjectSchema<F> => ({
  kind: 'object',
  fields: properties,
})

export const array = <I extends Schema>(element: I): ArraySchema<I> => ({
  kind: 'array',
  item: element,
})

export const string = (): StringSchema => ({ kind: 'string' })
export const boolean = (): BooleanSchema => ({ kind: 'boolean' })

type Schema = ObjectSchema | ArraySchema | StringSchema | BooleanSchema

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

interface StringSchema {
  kind: 'string'
}

interface BooleanSchema {
  kind: 'boolean'
}
