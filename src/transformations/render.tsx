import * as F from '../flat-node'
import type { Root } from '../nodes'
import type { EditorStore } from '../store'
import type { Key } from '../types'
import { createRootNodePath, pushIndex, type NodePath } from '../index-path'

export function renderRoot({
  node,
  store,
}: {
  node: F.FlatNode<Root>
  store: EditorStore
}): React.ReactNode {
  const { key } = node
  return (
    <article
      key={key}
      id={key}
      data-key={key}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
    >
      {render({
        key: node.value,
        store,
        nodePath: createRootNodePath(store),
      })}
    </article>
  )
}

export function render({
  key,
  store,
  nodePath,
  className,
}: {
  key: Key
  store: EditorStore
  nodePath: NodePath
  className?: string
}): React.ReactNode {
  const node = store.get(key)
  const attributes = { id: key, 'data-key': key }

  if ('render' in node.schema && typeof node.schema.render === 'function') {
    return node.schema.render({ node, store, nodePath, className })
  } else if (F.isKind('boolean', node)) {
    return (
      <input
        key={key}
        {...attributes}
        type="checkbox"
        checked={node.value}
        onChange={() => void 0}
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
            nodePath: pushIndex(nodePath, index),
          }),
        )}
      </HTMLTag>
    )
  } else if (F.isKind('array', node)) {
    const HTMLTag = node.schema.htmlTag ?? 'div'

    return (
      <HTMLTag key={key} {...attributes} className={className}>
        {node.value.map((itemKey, index) =>
          render({ key: itemKey, store, nodePath: pushIndex(nodePath, index) }),
        )}
      </HTMLTag>
    )
  } else if (F.isKind('union', node) || F.isKind('wrapper', node)) {
    const HTMLTag = node.schema.htmlTag

    return HTMLTag !== undefined ? (
      <HTMLTag key={key} {...attributes} className={className}>
        {render({ key: node.value, store, nodePath: pushIndex(nodePath, 0) })}
      </HTMLTag>
    ) : (
      render({ key: node.value, store, nodePath: pushIndex(nodePath, 0) })
    )
  } else {
    throw new Error(`Unknown node kind: ${node.schema.kind}`)
  }
}
