import '@picocss/pico/css/pico.min.css'
import './App.css'
import { padStart } from 'es-toolkit/compat'
import { useEffect } from 'react'
import { DebugPanel } from './components/debug-panel'
import type { FlatNode } from './flat-node'
import { useEditorStore } from './hooks/use-editor-store'
import { Root } from './nodes'
import type { JSONValue } from './schema'
import { loadJson } from './transformations/load'
import { storeRoot } from './transformations/store'
import type { Key } from './types'
import { render } from './transformations/render'

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
      {store.has(rootKey) && render({ key: rootKey, store })}
      <DebugPanel
        labels={{
          json: 'External JSON Value',
          entries: 'Internal Flat Storage',
        }}
        getCurrentValue={{
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
        showOnStartup={{ entries: true, json: true }}
      />
    </main>
  )
}
