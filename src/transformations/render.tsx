import * as F from '../flat-node'
import {
  EdgeRelationType,
  getRootRangePosition,
  type NodeRangePosition,
  pushIndex,
} from '../index-path'
import type { Root } from '../nodes'
import type { EditorStore } from '../store'
import type { Key } from '../types'

export function renderRoot({
  node,
  store,
  onKeyDown,
}: {
  node: F.FlatNode<Root>
  store: EditorStore
  onKeyDown: React.KeyboardEventHandler
}): React.ReactNode {
  const { key } = node
  const rootRangePosition = getRootRangePosition(store)
  const childPos = pushIndex(rootRangePosition, 0)

  return (
    <article
      key={key}
      id={key}
      data-key={key}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onKeyDown={onKeyDown}
      onBeforeInput={() => {}}
    >
      {render({ key: node.value, store, pos: childPos })}
    </article>
  )
}

export function render({
  key,
  store,
  pos,
  className,
}: {
  key: Key
  store: EditorStore
  pos: NodeRangePosition | null
  className?: string
}): React.ReactNode {
  const node = store.get(key)
  const attributes = { id: key, 'data-key': key }

  if ('render' in node.schema && typeof node.schema.render === 'function') {
    return node.schema.render({ node, store, pos, className })
  } else if (F.isKind('boolean', node)) {
    return (
      <input
        key={key}
        {...attributes}
        type="checkbox"
        checked={node.value}
        onChange={(e) =>
          store.update((tx) => tx.update(node, () => e.target.checked))
        }
      />
    )
  } else if (F.isKind('string', node)) {
    return (
      <span key={key} {...attributes} data-type="text">
        {node.value}
      </span>
    )
  } else if (F.isKind('object', node)) {
    const HTMLTag = node.schema.htmlTag ?? 'div'
    return (
      <HTMLTag key={key} {...attributes} className={className}>
        {node.schema.fieldOrder.map((property, index) =>
          render({
            key: node.value[property],
            store,
            pos: pushIndex(pos, index),
          }),
        )}
      </HTMLTag>
    )
  } else if (F.isKind('array', node)) {
    const HTMLTag = node.schema.htmlTag ?? 'div'

    const markRange =
      pos != null &&
      pos.left.type === EdgeRelationType.Inside &&
      pos.right.type === EdgeRelationType.Inside &&
      pos.left.path[0] !== pos.right.path[0]
        ? { start: pos.left.path[0], end: pos.right.path[0] }
        : null

    return (
      <HTMLTag key={key} {...attributes} className={className}>
        {node.value.map((itemKey, index) => {
          const shouldMark =
            markRange != null &&
            markRange.start <= index &&
            markRange.end >= index

          return render({
            key: itemKey,
            store,
            pos: pushIndex(pos, index),
            className: shouldMark ? 'selected' : undefined,
          })
        })}
      </HTMLTag>
    )
  } else if (F.isKind('union', node) || F.isKind('wrapper', node)) {
    const HTMLTag = node.schema.htmlTag

    return HTMLTag !== undefined ? (
      <HTMLTag key={key} {...attributes} className={className}>
        {render({ key: node.value, store, pos: pushIndex(pos, 0) })}
      </HTMLTag>
    ) : (
      render({
        key: node.value,
        store,
        pos: pushIndex(pos, 0),
        className,
      })
    )
  } else {
    throw new Error(`Unknown node kind: ${node.schema.kind}`)
  }
}
