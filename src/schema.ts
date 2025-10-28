export const object = <P extends Record<string, Schema>>(
  properties: P,
): ObjectSchema<P> => ({
  kind: 'object',
  properties,
})

export const array = <E extends Schema>(element: E): ArraySchema<E> => ({
  kind: 'array',
  element,
})

export const string = (): StringSchema => ({ kind: 'string' })
export const boolean = (): BooleanSchema => ({ kind: 'boolean' })

type Schema = ObjectSchema | ArraySchema | StringSchema | BooleanSchema

interface ObjectSchema<
  P extends Record<string, Schema> = Record<string, Schema>,
> {
  kind: 'object'
  properties: P
}

interface ArraySchema<E extends Schema = Schema> {
  kind: 'array'
  element: E
}

interface StringSchema {
  kind: 'string'
}

interface BooleanSchema {
  kind: 'boolean'
}
