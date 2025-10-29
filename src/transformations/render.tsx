import * as F from '../flat-node'
import type { Root } from '../nodes'
import type { EditorStore } from '../store'
import type { Key } from '../types'

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
      {render({ key: node.value, store })}
    </article>
  )
}

export function render({
  key,
  store,
}: {
  key: Key
  store: EditorStore
}): React.ReactNode {
  const node = store.get(key)
  const attributes = { id: key, 'data-key': key }

  if ('render' in node.schema && typeof node.schema.render === 'function') {
    return node.schema.render({ node, store })
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
      <HTMLTag key={key} {...attributes}>
        {node.schema.fieldOrder.map((property) =>
          render({ key: node.value[property], store }),
        )}
      </HTMLTag>
    )
  } else if (F.isKind('array', node)) {
    const HTMLTag = node.schema.htmlTag ?? 'div'

    return (
      <HTMLTag key={key} {...attributes}>
        {node.value.map((itemKey) => render({ key: itemKey, store }))}
      </HTMLTag>
    )
  } else if (F.isKind('union', node) || F.isKind('wrapper', node)) {
    const HTMLTag = node.schema.htmlTag

    return HTMLTag !== undefined ? (
      <HTMLTag key={key} {...attributes}>
        {render({ key: node.value, store })}
      </HTMLTag>
    ) : (
      render({ key: node.value, store })
    )
  } else {
    throw new Error(`Unknown node kind: ${node.schema.kind}`)
  }
}
