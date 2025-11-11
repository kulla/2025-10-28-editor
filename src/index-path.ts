import * as F from './flat-node'
import type { Cursor } from './selection'
import type { EditorStore } from './store'
import type { Key } from './types'

export interface NodePath {
  cursor: Cursor<IndexPath> | null
  currentNodePath: IndexPath
}

export function pushIndex(path: NodePath, index: number): NodePath {
  return {
    cursor: path.cursor,
    currentNodePath: [...path.currentNodePath, index],
  }
}

export function createRootNodePath(store: EditorStore): NodePath {
  const cursor = store.getCursor()

  return {
    cursor:
      cursor == null
        ? null
        : {
            left: getIndexPath({
              node: store.get(cursor.left.key),
              store,
            }),
            right: getIndexPath({
              node: store.get(cursor.right.key),
              store,
            }),
          },
    currentNodePath: [0],
  }
}

function getIndexPath({
  node,
  store,
}: {
  node: F.FlatNode
  store: EditorStore
}) {
  const result: number[] = []
  let currentNode = node

  while (currentNode.parentKey != null) {
    const parentNode = store.get(currentNode.parentKey)

    const index = getIndexWithin(parentNode, currentNode.key)
    result.unshift(index)

    currentNode = parentNode
  }

  return result
}

function getIndexWithin(parentNode: F.FlatNode, childKey: Key): number {
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

export type IndexPath = number[]
