import * as F from '../flat-node'
import type { ArraySchema } from '../schema'
import type { EditorStore, Transaction } from '../store'
import { selectEnding } from './selection'

export function mergeNeighbors({
  node,
  tx,
  index,
}: {
  node: F.FlatNode<ArraySchema>
  tx: Transaction
  index: number
}) {
  if (node.value[index] == null || node.value[index + 1] == null) return

  const leftNode = tx.store.get(node.value[index])
  const rightNode = tx.store.get(node.value[index + 1])

  const rightText = toText({ node: rightNode, store: tx.store })

  if (rightText == null) return

  selectEnding({ node: leftNode, tx })

  const added = addText({ node: leftNode, text: rightText, tx })

  if (added) {
    tx.update(node, (prev) => {
      return [...prev.slice(0, index + 1), ...prev.slice(index + 2)]
    })
  }
}

function toText({
  node,
  store,
}: {
  node: F.FlatNode
  store: EditorStore
}): string | null {
  if (F.isKind('string', node)) {
    return node.value
  } else if (F.isKind('wrapper', node) || F.isKind('union', node)) {
    return toText({ node: store.get(node.value), store })
  } else {
    return null
  }
}

function addText({
  node,
  text,
  tx,
}: {
  node: F.FlatNode
  text: string
  tx: Transaction
}): boolean {
  if (F.isKind('string', node)) {
    tx.update(node, (prev) => prev + text)
    return true
  } else if (F.isKind('wrapper', node) || F.isKind('union', node)) {
    return addText({ node: tx.store.get(node.value), text, tx })
  }

  return false
}
