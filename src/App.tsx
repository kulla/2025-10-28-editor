import '@picocss/pico/css/pico.min.css'
import './App.css'
import { isEqual, padStart } from 'es-toolkit/compat'
import { useCallback, useEffect } from 'react'
import { DebugPanel } from './components/debug-panel'
import type { FlatNode } from './flat-node'
import { useEditorStore } from './hooks/use-editor-store'
import { Root } from './nodes'
import type { JSONValue } from './schema'
import { getCurrentCursor, setSelection } from './selection'
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
      {store.has(rootKey) &&
        renderRoot({ node: store.get(rootKey, Root), store })}
      <DebugPanel
        labels={{
          cursor: 'Current Cursor',
          json: 'External JSON Value',
          entries: 'Internal Flat Storage',
        }}
        getCurrentValue={{
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
        showOnStartup={{ cursor: true, entries: true, json: true }}
      />
    </main>
  )
}
