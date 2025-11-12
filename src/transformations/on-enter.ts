import * as F from '../flat-node'
import { EdgeRelationType } from '../index-path'
import { isCollapsed } from '../selection'
import { type Command, CommandResultType } from './command'
import { createEmptyNode } from './create-empty-node'
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

    console.log('Inserting new array item after index', afterIndex)

    const newValueSchema =
      node.value[afterIndex] != null
        ? tx.store.get(node.value[afterIndex]).schema
        : node.schema.item

    console.log('New value schema', newValueSchema)

    const newValue = createEmptyNode(newValueSchema)

    console.log('New value', newValue)

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

    return { type: CommandResultType.Success }
  }

  return { type: CommandResultType.Failure }
}
