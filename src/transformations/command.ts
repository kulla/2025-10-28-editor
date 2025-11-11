import { takeWhile, zip } from 'es-toolkit'
import type { FlatNode } from '../flat-node'
import {
  EdgeRelationType,
  getIndexWithin,
  type NodeRangePosition,
} from '../index-path'
import type { Point } from '../selection'
import type { EditorStore, Transaction } from '../store'
import { isNonEmptyArray, type Key } from '../types'

export function dispatch<P extends object>({
  command,
  store,
  payload,
}: {
  command: Command<P>
  store: EditorStore
  payload: P
}): CommandResult {
  return store.update((tx) => {
    const cursor = store.getCursor()

    if (cursor == null) return { type: CommandResultType.Failure }

    /*
    if (command !== Command.DeleteRange && !isCollapsed(cursor)) {
      const result = dispatchCommand(store, Command.DeleteRange)

      if (!result) return false

      if (
        command === Command.DeleteBackward ||
        command === Command.DeleteForward
      ) {
        // If we delete a range, we don't need to handle backward or forward deletion
        return true
      }
    }*/

    const { left, right } = cursor
    const leftPath = getPathToRoot(store, left)
    const rightPath = getPathToRoot(store, right)

    const commonPath: Path = takeWhile(
      zip(leftPath, rightPath),
      ([a, b]) => a.key === b.key,
    ).map(([a, _]) => a)

    const startIndex = leftPath
      .slice(Math.max(commonPath.length - 1, 0))
      .map(({ index }) => index) as number[]
    const endIndex = rightPath
      .slice(Math.max(commonPath.length - 1, 0))
      .map(({ index }) => index) as number[]

    let targetKey = commonPath.pop()?.key ?? leftPath[0].key

    while (true) {
      const result = command({
        ...payload,
        node: store.get(targetKey),
        tx,
        pos: calculatePos(startIndex, endIndex),
      })

      if (result.type !== CommandResultType.DispatchParent) return result

      const nextTarget = commonPath.pop()

      if (nextTarget == null) break

      // TODO: Handle undefined index case (by fixing the types)
      startIndex.unshift(nextTarget.index as number)
      endIndex.unshift(nextTarget.index as number)

      targetKey = nextTarget.key
    }

    return { type: CommandResultType.Failure }
  })
}

function calculatePos(
  startIndex: number[],
  endIndex: number[],
): NodeRangePosition {
  return {
    left: isNonEmptyArray(startIndex)
      ? { type: EdgeRelationType.Inside, path: startIndex }
      : { type: EdgeRelationType.ThisNode },
    right: isNonEmptyArray(endIndex)
      ? { type: EdgeRelationType.Inside, path: endIndex }
      : { type: EdgeRelationType.ThisNode },
  }
}

export type Command<AdditionalPayload extends {} = object> = (
  args: AdditionalPayload & {
    node: FlatNode
    tx: Transaction
    pos: NodeRangePosition
  },
) => CommandResult

export enum CommandResultType {
  Success = 'success',
  Failure = 'failure',
  DispatchParent = 'dispatchParent',
}

type CommandResult =
  | { type: CommandResultType.Success }
  | { type: CommandResultType.Failure }
  | { type: CommandResultType.DispatchParent }

export function getPathToRoot(store: EditorStore, point: Point): Path {
  const path: Path = [
    point.offset != null
      ? { key: point.key, index: point.offset }
      : { key: point.key },
  ]
  let currentNode = store.get(point.key)

  while (currentNode.parentKey != null) {
    const parent = store.get(currentNode.parentKey)
    const index = getIndexWithin(parent, currentNode.key)

    path.unshift({ key: parent.key, index })

    currentNode = parent
  }

  return path
}

type Path = PathFrame[]
type PathFrame = { key: Key; index?: number }
