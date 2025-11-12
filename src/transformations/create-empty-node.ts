import { range } from 'es-toolkit'
import {
  isArraySchema,
  isBooleanSchema,
  isObjectSchema,
  isStringSchema,
  isUnionSchema,
  isWrapperSchema,
  type JSONValue,
  type Schema,
} from '../schema'

export function createEmptyNode<S extends Schema>(schema: S): JSONValue<S> {
  if (isStringSchema(schema)) {
    return ''
  } else if (isBooleanSchema(schema)) {
    return false
  } else if (isArraySchema(schema)) {
    return range(schema.defaultLength ?? 1).map(() =>
      createEmptyNode(schema.item),
    )
  } else if (isWrapperSchema(schema)) {
    return schema.wrapIso.to(createEmptyNode(schema.wrapped))
  } else if (isUnionSchema(schema)) {
    const firstOption = schema.options[0]
    return createEmptyNode(firstOption)
  } else if (isObjectSchema(schema)) {
    return Object.fromEntries(
      schema.fieldOrder.map((fieldKey) => {
        const fieldSchema = schema.fields[fieldKey]
        return [fieldKey, createEmptyNode(fieldSchema)]
      }),
    )
  } else {
    throw new Error(`Cannot create empty node for schema kind: ${schema.kind}`)
  }
}
