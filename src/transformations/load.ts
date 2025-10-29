import { mapValues } from 'es-toolkit'
import * as F from '../flat-node'
import type { JSONValue, Schema } from '../schema'
import type { EditorStore } from '../store'
import type { Key } from '../types'

export function loadJson<S extends Schema>({
  node,
  store,
}: {
  node: F.FlatNode<S>
  store: EditorStore
}): JSONValue<S> {
  if (F.isKind('string', node) || F.isKind('boolean', node)) {
    return node.value
  } else if (F.isKind('wrapper', node)) {
    const childNode = store.get(node.value)

    return node.schema.wrapIso.to(loadJson({ node: childNode, store }))
  } else if (F.isKind('array', node)) {
    return node.value.map((childKey) =>
      loadJson({ node: store.get(childKey), store }),
    )
  } else if (F.isKind('union', node)) {
    return loadJson({ node: store.get(node.value), store })
  } else if (F.isKind('object', node)) {
    return mapValues(node.value, (childKey: Key) =>
      loadJson({ node: store.get(childKey), store }),
    )
  } else {
    throw new Error('Not implemented yet')
  }
}
