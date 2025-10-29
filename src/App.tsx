import '@picocss/pico/css/pico.min.css'
import './App.css'
import { padStart } from 'es-toolkit/compat'
import { useEffect } from 'react'
import { DebugPanel } from './components/debug-panel'
import type { FlatNode } from './flat-node'
import { useEditorStore } from './hooks/use-editor-store'
import { Root } from './nodes'
import type { JSONValue } from './schema'
import { attachRoot } from './transformations/store'
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

  useEffect(() => {
    store.update((tx) => {
      if (!store.has(rootKey)) {
        attachRoot({ tx, node: { schema: Root, value: initialValue }, rootKey })
      }
    })
  }, [store])

  return (
    <main className="p-10">
      <h1>Editor</h1>
      <DebugPanel
        labels={{ entries: 'Internal Storage' }}
        getCurrentValue={{
          entries: () => {
            const stringifyEntry = ([key, entry]: [string, FlatNode]) =>
              `${padStart(key, 4)}: ${JSON.stringify(entry.value)}`

            const lines = store.getEntries().map(stringifyEntry)

            lines.sort()

            return lines.join('\n')
          },
        }}
        showOnStartup={{ entries: true }}
      />
    </main>
  )
}
