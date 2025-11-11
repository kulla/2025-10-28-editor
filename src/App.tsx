import '@picocss/pico/css/pico.min.css'
import './App.css'
import { isEqual, padStart } from 'es-toolkit/compat'
import { html as beautifyHtml } from 'js-beautify'
import { useCallback, useEffect } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DebugPanel } from './components/debug-panel'
import type { FlatNode } from './flat-node'
import { useEditorStore } from './hooks/use-editor-store'
import { Root } from './nodes'
import type { JSONValue } from './schema'
import { getCurrentCursor, setSelection } from './selection'
import { dispatch } from './transformations/command'
import { insertText } from './transformations/insert-text'
import { loadJson } from './transformations/load'
import { renderRoot } from './transformations/render'
import { storeRoot } from './transformations/store'
import type { Key } from './types'

const rootKey = 'root' as Key
const initialValue: JSONValue<Root> = [
  { type: 'paragraph', value: 'Hello, world!' },
  {
    exercise: [{ type: 'paragraph', value: 'What is the capital of France?' }],
    answers: [
      { text: 'Paris', isCorrect: true },
      { text: 'London', isCorrect: false },
      { text: 'Berlin', isCorrect: false },
    ],
  },
]

export default function App() {
  const { store } = useEditorStore()

  const onKeyDown: React.KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        dispatch({ command: insertText, store, payload: { text: event.key } })
      } else if (event.key === 'Enter') {
        // manager.dispatchCommand(Command.InsertNewElement)
      } else if (event.key === 'Backspace') {
        //dispatchCommand(store, Command.DeleteBackward)
      } else if (event.key === 'Delete') {
        // dispatchCommand(store, Command.DeleteForward)
      }

      if (
        (event.ctrlKey && ['c', 'v', 'x'].includes(event.key.toLowerCase())) ||
        ['Enter', 'Tab', 'Delete', 'Backspace'].includes(event.key) ||
        (event.key.length === 1 && !event.ctrlKey && !event.metaKey)
      ) {
        event.preventDefault()
      }
    },
    [store],
  )

  const renderedNode =
    store.has(rootKey) &&
    renderRoot({ node: store.get(rootKey, Root), store, onKeyDown })

  const updateCursorFromSelection = useCallback(() => {
    const cursor = getCurrentCursor()

    if (!isEqual(cursor, store.getCursor())) {
      store.update((state) => state.setCursor(cursor))
    }
  }, [store])

  useEffect(() => {
    document.addEventListener('selectionchange', updateCursorFromSelection)

    return () => {
      document.removeEventListener('selectionchange', updateCursorFromSelection)
    }
  }, [updateCursorFromSelection])

  useEffect(() => {
    // Use updateCount here to enforce the effect to run after each store update
    if (store.updateCount < 0) return

    const cursor = getCurrentCursor()

    if (!isEqual(cursor, store.getCursor())) setSelection(store.getCursor())
  }, [store, store.updateCount])

  useEffect(() => {
    store.update((tx) => {
      if (!store.has(rootKey)) {
        storeRoot({ tx, node: { schema: Root, value: initialValue }, rootKey })
      }
    })
  }, [store])

  return (
    <main className="p-10">
      <h1>Editor</h1>
      {renderedNode}
      <DebugPanel
        labels={{
          html: 'Rendered HTML',
          cursor: 'Current Cursor',
          json: 'External JSON Value',
          entries: 'Internal Flat Storage',
        }}
        getCurrentValue={{
          html: () => {
            return beautifyHtml(renderToStaticMarkup(renderedNode), {
              indent_size: 2,
              wrap_line_length: 70,
            })
          },
          cursor: () => {
            const cursor = store.getCursor()
            return JSON.stringify(cursor, null, 2)
          },
          json: () => {
            if (!store.has(rootKey)) {
              return 'Store is empty'
            }

            const rootNode = store.get(rootKey)
            const jsonValue = loadJson({ node: rootNode, store })
            return JSON.stringify(jsonValue, null, 2)
          },
          entries: () => {
            const stringifyEntry = ([key, entry]: [string, FlatNode]) =>
              `${padStart(key, 4)}: ${JSON.stringify(entry.value)}`

            const lines = store.getEntries().map(stringifyEntry)

            lines.sort()

            return lines.join('\n')
          },
        }}
        showOnStartup={{
          html: true,
          cursor: false,
          entries: false,
          json: true,
        }}
      />
    </main>
  )
}
