import * as F from '../flat-node'
import { EdgeRelationType } from '../index-path'
import { isCollapsed } from '../selection'
import { failure } from '../types'
import { type Command, CommandResultType } from './command'
import { createEmptyNode } from './create-empty-node'
import { selectBeginning } from './selection'
import { split } from './split'
import { store } from './store'

export const onEnter: Command = ({ node, tx, pos }) => {
  if (!isCollapsed(pos)) return { type: CommandResultType.Failure }

  if (
    F.isKind('string', node) ||
    F.isKind('union', node) ||
    F.isKind('object', node) ||
    F.isKind('wrapper', node)
  ) {
    return { type: CommandResultType.DispatchParent }
  } else if (F.isKind('array', node)) {
    const afterIndex =
      pos.left.type === EdgeRelationType.Inside
        ? pos.left.path[0]
        : node.value.length - 1
    const afterKey = node.value[afterIndex]

    const splitResult =
      pos.left.type === EdgeRelationType.Inside && afterKey != null
        ? split({
            node: tx.store.get(afterKey),
            tx,
            path: pos.left.path.slice(1),
          })
        : failure()

    const newValueSchema =
      afterKey != null ? tx.store.get(afterKey).schema : node.schema.item

    const newValue = splitResult.success
      ? splitResult.value()
      : createEmptyNode(newValueSchema)

    const newNodeKey = store({
      tx,
      parentKey: node.key,
      node: { schema: newValueSchema, value: newValue },
    })

    tx.update(node, (prev) => {
      return [
        ...prev.slice(0, afterIndex + 1),
        newNodeKey,
        ...prev.slice(afterIndex + 1),
      ]
    })

    selectBeginning({ node: tx.store.get(newNodeKey), tx })

    return { type: CommandResultType.Success }
  }

  return { type: CommandResultType.Failure }
}
