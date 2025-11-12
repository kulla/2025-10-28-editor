import * as F from '../flat-node'
import { EdgeRelationType } from '../index-path'
import { isCollapsed } from '../selection'
import { type Command, CommandResultType } from './command'
import { createEmptyNode } from './create-empty-node'
import { mergeNeighbors } from './merge'
import { selectEnding } from './selection'
import { store } from './store'

export const deleteRange: Command = ({ node, tx, pos }) => {
  if (isCollapsed(pos)) return { type: CommandResultType.Failure }

  if (F.isKind('string', node)) {
    const startIndex =
      pos.left.type === EdgeRelationType.Inside ? pos.left.path[0] : 0
    const endIndex =
      pos.right.type === EdgeRelationType.Inside
        ? pos.right.path[0]
        : node.value.length

    tx.update(node, (prev) => prev.slice(0, startIndex) + prev.slice(endIndex))
    tx.setCaret({ key: node.key, offset: startIndex })

    return { type: CommandResultType.Success }
  } else if (F.isKind('union', node) || F.isKind('wrapper', node)) {
    return { type: CommandResultType.Failure }
  } else if (
    F.isKind('array', node) &&
    pos.left.type === EdgeRelationType.Inside &&
    pos.right.type === EdgeRelationType.Inside
  ) {
    const startIndex = pos.left.path[0]
    const endIndex = pos.right.path[0]

    if (startIndex !== endIndex) {
      tx.update(node, (prev) => {
        const newArray = [
          ...prev.slice(0, startIndex),
          ...prev.slice(endIndex + 1),
        ]

        if (newArray.length === 0) {
          const newItem = createEmptyNode(node.schema.item)
          const newItemKey = store({
            tx,
            parentKey: node.key,
            node: { schema: node.schema.item, value: newItem },
          })
          newArray.push(newItemKey)
        }

        selectEnding({
          node: tx.store.get(newArray[Math.max(0, startIndex - 1)]),
          tx,
        })

        return newArray
      })
    }
  }

  return { type: CommandResultType.Failure }
}

export const deleteForward: Command = ({ node, tx, pos }) => {
  if (!isCollapsed(pos)) return { type: CommandResultType.Failure }

  if (F.isKind('string', node)) {
    if (pos.left.type !== EdgeRelationType.Inside)
      return { type: CommandResultType.Failure }

    const index = pos.left.path[0]

    if (index >= node.value.length)
      return { type: CommandResultType.DispatchParent }

    tx.update(node, (prev) => prev.slice(0, index) + prev.slice(index + 1))
    tx.setCaret({ key: node.key, offset: index })

    return { type: CommandResultType.Success }
  } else if (
    F.isKind('array', node) &&
    pos.left.type === EdgeRelationType.Inside
  ) {
    const index = pos.left.path[0]

    mergeNeighbors({ node, tx, index })

    return { type: CommandResultType.Success }
  }

  return { type: CommandResultType.DispatchParent }
}

export const deleteBackward: Command = ({ node, tx, pos }) => {
  if (!isCollapsed(pos)) return { type: CommandResultType.Failure }

  if (F.isKind('string', node)) {
    if (pos.left.type !== EdgeRelationType.Inside)
      return { type: CommandResultType.Failure }

    const index = pos.left.path[0]

    if (index === 0) return { type: CommandResultType.DispatchParent }

    tx.update(node, (prev) => prev.slice(0, index - 1) + prev.slice(index))
    tx.setCaret({ key: node.key, offset: index - 1 })

    return { type: CommandResultType.Success }
  } else if (
    F.isKind('array', node) &&
    pos.left.type === EdgeRelationType.Inside
  ) {
    const index = pos.left.path[0]

    mergeNeighbors({ node, tx, index: index - 1 })

    return { type: CommandResultType.Success }
  }

  return { type: CommandResultType.DispatchParent }
}
