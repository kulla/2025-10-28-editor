import type { Key } from '../flat-node'
import * as N from '../nested-node'
import type { Schema } from '../schema'
import type { Transaction } from '../store'

export function attachRoot(args: {
  tx: Transaction
  node: N.NestedNode<Extract<Schema, { kind: 'wrapper'; isRoot: true }>>
  rootKey: Key
}) {
  const { tx, node, rootKey } = args

  return tx.attachRoot(rootKey, {
    schema: node.schema,
    key: rootKey,
    parentKey: null,
    value: store({ tx, parentKey: rootKey, node: N.getChild(node) }),
  })
}

function store(args: {
  tx: Transaction
  parentKey: Key
  node: N.NestedNode
}): Key {
  const { tx, parentKey, node } = args

  if (N.isKind('string', node) || N.isKind('boolean', node)) {
    return tx.insert((key) => ({
      schema: node.schema,
      key,
      parentKey,
      value: node.value,
    }))
  } else if (N.isKind('wrapper', node)) {
    return tx.insert((key) => ({
      schema: node.schema,
      key,
      parentKey,
      value: store({ tx, parentKey: key, node: N.getChild(node) }),
    }))
  } else if (N.isKind('array', node)) {
    return tx.insert((key) => ({
      schema: node.schema,
      key,
      parentKey,
      value: N.mapArrayItems(node, (itemNode) =>
        store({ tx, parentKey: key, node: itemNode }),
      ),
    }))
  } else if (N.isKind('object', node)) {
    return tx.insert((key) => ({
      schema: node.schema,
      key,
      parentKey,
      value: N.mapObjectProperties(node, (propertyNode, propertyKey) => [
        propertyKey,
        store({ tx, parentKey: key, node: propertyNode }),
      ]),
    }))
  } else if (N.isKind('union', node)) {
    return tx.insert((key) => ({
      schema: node.schema,
      key,
      parentKey,
      value: store({ tx, parentKey: key, node: node }),
    }))
  } else {
    throw new Error(`Unsupported schema kind: ${node.schema.kind}`)
  }
}
