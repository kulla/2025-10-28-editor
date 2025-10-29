import { isKey, type Key } from './types'

export interface Cursor<P = Point> {
  start: P
  end: P
}

export interface Point {
  key: Key
  offset?: number
}

export function getCurrentCursor(): Cursor | null {
  const selection = window.getSelection()

  if (selection == null || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)

  const startPoint = getPoint(range.startContainer, range.startOffset)
  const endPoint = getPoint(range.endContainer, range.endOffset)

  if (startPoint == null || endPoint == null) return null

  return { start: startPoint, end: endPoint }
}

export function getPoint(
  node: Node | null,
  offset: number | null,
): Point | null {
  if (node == null) return null

  const htmlNode = node instanceof HTMLElement ? node : node.parentElement

  if (htmlNode == null) return null

  const { key, type } = htmlNode.dataset

  if (!isKey(key)) return getPoint(node.parentNode, null)

  return type === 'text' && offset != null ? { key, offset } : { key }
}

export function isCollapsed(cursor: Cursor): boolean {
  const { start, end } = cursor
  return start.key === end.key && start.offset === end.offset
}

export function setSelection(cursor: Cursor | null) {
  if (cursor == null) {
    window.getSelection()?.removeAllRanges()
    return
  }

  const { start, end } = cursor

  const selection = window.getSelection()
  if (selection == null) return

  const range = document.createRange()

  const startNode = document.getElementById(start.key)
  const endNode = document.getElementById(end.key)

  if (startNode == null || endNode == null) return

  if (start.offset != null) {
    range.setStart(startNode.firstChild ?? startNode, start.offset)
  } else {
    range.setStart(startNode, 0)
  }

  if (end.offset != null) {
    range.setEnd(endNode.firstChild ?? endNode, end.offset)
  } else {
    range.setEnd(endNode, 0)
  }

  selection.addRange(range)

  selection.removeAllRanges()
  selection.addRange(range)
}
