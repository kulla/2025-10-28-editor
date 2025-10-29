import * as N from '../nested-node'
import type { Root } from '../nodes'
import type { Transaction } from '../store'
import type { Key } from '../types'

export function storeRoot(args: {
  tx: Transaction
  node: N.NestedNode<Root>
  rootKey: Key
}) {
  const { tx, node, rootKey } = args

  return tx.attachRoot(rootKey, {
    schema: node.schema,
    key: rootKey,
    parentKey: null,
    value: store({ tx, parentKey: rootKey, node: N.getWrappedChild(node) }),
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
      value: store({ tx, parentKey: key, node: N.getWrappedChild(node) }),
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
      value: Object.fromEntries(
        N.mapObjectProperties(node, (propertyNode, propertyKey) => [
          propertyKey,
          store({ tx, parentKey: key, node: propertyNode }),
        ]),
      ),
    }))
  } else if (N.isKind('union', node)) {
    return tx.insert((key) => ({
      schema: node.schema,
      key,
      parentKey,
      value: store({ tx, parentKey: key, node: N.getUnionOption(node) }),
    }))
  } else {
    throw new Error(`Unsupported schema kind: ${node.schema.kind}`)
  }
}
