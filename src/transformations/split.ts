import * as F from '../flat-node'
import type { JSONValue, Schema } from '../schema'
import type { Transaction } from '../store'
import { failure, type Result, success } from '../types'

export function split<S extends Schema>({
  tx,
  node,
  path,
}: {
  tx: Transaction
  node: F.FlatNode<S>
  path: number[]
}): Result<() => JSONValue<S>> {
  if (F.isKind('string', node) && path.length === 1) {
    return success(() => {
      const index = path[0]

      const before = node.value.slice(0, index)
      const after = node.value.slice(index)

      tx.update(node, () => before)

      return after
    })
  } else if (
    (F.isKind('wrapper', node) || F.isKind('union', node)) &&
    path.length > 0
  ) {
    const splitChild = split({
      tx,
      node: tx.store.get(node.value),
      path: path.slice(1),
    })

    if (splitChild.success) {
      return success(() => {
        const childAfter = splitChild.value()

        return F.isKind('wrapper', node)
          ? node.schema.wrapIso.to(childAfter)
          : childAfter
      })
    } else {
      return failure()
    }
  } else if (F.isKind('object', node) && node.schema.split != null) {
    return node.schema.split({ node, tx, path })
  }

  return failure()
}
