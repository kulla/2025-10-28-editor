import * as F from '../flat-node'
import { EdgeRelationType } from '../index-path'
import { isCollapsed } from '../selection'
import { type Command, CommandResultType } from './command'

export const insertText: Command<{ text: string }> = ({
  text,
  node,
  tx,
  pos,
}) => {
  if (!F.isKind('string', node)) return { type: CommandResultType.Failure }
  if (pos == null) return { type: CommandResultType.Failure }
  if (!isCollapsed(pos)) return { type: CommandResultType.Failure }
  if (pos.left.type !== EdgeRelationType.Inside)
    return { type: CommandResultType.Failure }

  const index = pos.left.path[0]

  tx.update(node, (prev) => prev.slice(0, index) + text + prev.slice(index))
  tx.setCaret({ key: node.key, offset: index + text.length })

  return { type: CommandResultType.Success }
}
