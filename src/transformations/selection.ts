import * as F from '../flat-node'
import type { Transaction } from '../store'

export function selectBeginning({
  node,
  tx,
}: {
  node: F.FlatNode
  tx: Transaction
}) {
  if (F.isKind('string', node)) {
    tx.setCaret({ key: node.key, offset: 0 })
  } else if (F.isKind('boolean', node)) {
    tx.setCaret({ key: node.key })
  } else if (F.isKind('wrapper', node) || F.isKind('union', node)) {
    selectBeginning({ node: tx.store.get(node.value), tx })
  } else if (F.isKind('array', node)) {
    if (node.value.length === 0) {
      tx.setCaret({ key: node.key })
    } else {
      const firstItemKey = node.value[0]

      selectBeginning({ node: tx.store.get(firstItemKey), tx })
    }
  } else if (F.isKind('object', node)) {
    const firstProperty = node.schema.fieldOrder[0]
    const firstPropertyKey = node.value[firstProperty]

    selectBeginning({ node: tx.store.get(firstPropertyKey), tx })
  }
}
