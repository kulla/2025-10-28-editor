import * as F from '../flat-node'
import { EdgeRelationType } from '../index-path'
import { isCollapsed } from '../selection'
import { type Command, CommandResultType } from './command'

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
  }

  return { type: CommandResultType.Failure }
}

export const deleteForward: Command = ({ node, tx, pos }) => {
  if (!isCollapsed(pos)) return { type: CommandResultType.Failure }

  if (F.isKind('string', node)) {
    if (pos.left.type !== EdgeRelationType.Inside)
      return { type: CommandResultType.Failure }

    const index = pos.left.path[0]

    if (index >= node.value.length) return { type: CommandResultType.Failure }

    tx.update(node, (prev) => prev.slice(0, index) + prev.slice(index + 1))
    tx.setCaret({ key: node.key, offset: index })

    return { type: CommandResultType.Success }
  }

  return { type: CommandResultType.Failure }
}

export const deleteBackward: Command = ({ node, tx, pos }) => {
  if (!isCollapsed(pos)) return { type: CommandResultType.Failure }

  if (F.isKind('string', node)) {
    if (pos.left.type !== EdgeRelationType.Inside)
      return { type: CommandResultType.Failure }

    const index = pos.left.path[0]

    if (index === 0) return { type: CommandResultType.Failure }

    tx.update(node, (prev) => prev.slice(0, index - 1) + prev.slice(index))
    tx.setCaret({ key: node.key, offset: index - 1 })

    return { type: CommandResultType.Success }
  }

  return { type: CommandResultType.Failure }
}
