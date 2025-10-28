import { invariant } from 'es-toolkit'
import type { FlatNode, Key } from './flat-node'
import type { Cursor, Point } from './selection'

class PrefixKeyGenerator implements KeyGenerator {
  private counter = 0
  constructor(private readonly prefix: string) {}
  next(): Key {
    this.counter += 1
    return (this.prefix + this.counter) as Key
  }
}

interface KeyGenerator {
  next(): Key
}

export class EditorStore {
  private readonly nodes = new Map<Key, FlatNode>()
  private readonly updateListeners = new Set<() => void>()
  private currentTransaction: Transaction | null = null
  private cursor: Cursor | null = null
  private _updateCount = 0

  constructor(private readonly keyGenerator = new PrefixKeyGenerator('n')) {}

  getCursor() {
    return this.cursor
  }

  get(key: Key) {
    const node = this.nodes.get(key)

    invariant(node != null, `Value for key ${key} not found`)

    return node
  }

  has(key: Key): boolean {
    return this.nodes.has(key)
  }

  getEntries() {
    return Array.from(this.nodes.entries())
  }

  get updateCount() {
    return this._updateCount
  }

  addUpdateListener(listener: () => void) {
    this.updateListeners.add(listener)
  }

  removeUpdateListener(listener: () => void) {
    this.updateListeners.delete(listener)
  }

  update<A>(updateFn: (tx: Transaction) => A): A {
    if (this.currentTransaction) {
      // If we're already in a transaction, just call the update function directly
      return updateFn(this.currentTransaction)
    } else {
      this.currentTransaction = this.createNewTransaction()

      try {
        const result = updateFn(this.currentTransaction)

        this.incrementUpdateCount()

        for (const listener of this.updateListeners) {
          listener()
        }

        return result
      } finally {
        this.currentTransaction = null
      }
    }
  }

  private createNewTransaction(): Transaction {
    return {
      store: this,
      /*update: (key, updateFn) => {
        const currentValue = this.get(key)

        const newValue =
          typeof updateFn === 'function'
            ? updateFn(currentValue.value)
            : updateFn

        this.nodes.set(key, { ...currentValue, value: newValue })
      },*/
      attachRoot: (rootKey, value) => {
        invariant(
          !this.has(rootKey),
          `Root key ${rootKey} already exists in the store`,
        )

        this.nodes.set(rootKey, value)

        return rootKey
      },
      insert: (createValue) => {
        const newKey = this.keyGenerator.next()
        const newNode = createValue(newKey)

        this.nodes.set(newKey, newNode)

        return newKey
      },
      setCursor: (cursor) => {
        this.cursor = cursor
      },
      setCaret(point) {
        this.setCursor({ start: point, end: point })
      },
    }
  }

  private incrementUpdateCount() {
    this._updateCount += 1
  }
}

interface Transaction {
  /*update<S extends Schema>(
    key: Key,
    updateFn: ((current: FlatValue<S>) => FlatValue<S>) | FlatValue<S>,
  ): void*/
  attachRoot(rootKey: Key, value: FlatNode): void
  insert(createValue: (key: Key) => FlatNode): Key
  setCursor(cursor: Cursor | null): void
  setCaret(point: Point): void
  store: EditorStore
}
