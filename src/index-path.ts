import * as F from './flat-node'
import type { Cursor, Point } from './selection'
import type { EditorStore } from './store'
import { isNonEmptyArray, type Key, type NonEmptyArray } from './types'

export enum EdgeRelationType {
  BeforeThisNode = 'beforeThisNode',
  ThisNode = 'thisNode',
  Inside = 'inside',
  AfterThisNode = 'afterThisNode',
}

type EdgeRelationToNode =
  | { type: EdgeRelationType.BeforeThisNode }
  | { type: EdgeRelationType.ThisNode }
  | { type: EdgeRelationType.Inside; path: NonEmptyArray<number> }
  | { type: EdgeRelationType.AfterThisNode }

export type NodeRangePosition = Cursor<EdgeRelationToNode>

export function pushIndex(
  path: NodeRangePosition | null,
  index: number,
): NodeRangePosition | null {
  if (path == null) return null

  return {
    left: pushEdgeIndex(path.left, index, 'left'),
    right: pushEdgeIndex(path.right, index, 'right'),
  }
}

function pushEdgeIndex(
  edge: EdgeRelationToNode,
  index: number,
  edgeType: 'left' | 'right',
): EdgeRelationToNode {
  switch (edge.type) {
    case EdgeRelationType.BeforeThisNode:
    case EdgeRelationType.AfterThisNode:
      return edge
    case EdgeRelationType.ThisNode:
      return edgeType === 'left'
        ? { type: EdgeRelationType.BeforeThisNode }
        : { type: EdgeRelationType.AfterThisNode }
    case EdgeRelationType.Inside: {
      const [selectedIndex, ...restPath] = edge.path

      if (index < selectedIndex) {
        return { type: EdgeRelationType.AfterThisNode }
      } else if (index === selectedIndex) {
        return isNonEmptyArray(restPath)
          ? { type: EdgeRelationType.Inside, path: restPath }
          : { type: EdgeRelationType.ThisNode }
      } else {
        return { type: EdgeRelationType.AfterThisNode }
      }
    }
  }
}

export function getRootRangePosition(
  store: EditorStore,
): NodeRangePosition | null {
  const cursor = store.getCursor()

  if (cursor == null) return null

  return {
    left: getRootEdgeRelation({ point: cursor.left, store }),
    right: getRootEdgeRelation({ point: cursor.right, store }),
  }
}

function getRootEdgeRelation({
  point,
  store,
}: {
  point: Point
  store: EditorStore
}): EdgeRelationToNode {
  const result: number[] = []
  let currentNode = store.get(point.key)

  while (currentNode.parentKey != null) {
    const parentNode = store.get(currentNode.parentKey)

    const index = getIndexWithin(parentNode, currentNode.key)
    result.unshift(index)

    currentNode = parentNode
  }

  return isNonEmptyArray(result)
    ? { type: EdgeRelationType.Inside, path: result }
    : { type: EdgeRelationType.ThisNode }
}

export function getIndexWithin(parentNode: F.FlatNode, childKey: Key): number {
  if (F.isKind('object', parentNode)) {
    return parentNode.schema.fieldOrder.findIndex(
      (property) => parentNode.value[property] === childKey,
    )
  } else if (F.isKind('array', parentNode)) {
    return parentNode.value.indexOf(childKey)
  } else {
    return 0
  }
}
