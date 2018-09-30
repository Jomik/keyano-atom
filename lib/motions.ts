import { TextEditor } from "atom";
import { Selector } from "./selectors";

export function selectAllIn(editor: TextEditor, selector: Selector) {
  const buffer = editor.getBuffer();
  for (const selection of editor.getSelections()) {
    const selectionRange = selection.getBufferRange();
    let point = selectionRange.start;
    let ranges = [];
    while (selectionRange.containsPoint(point)) {
      const match = selector.next(point, buffer);
      if (match === undefined) {
        break;
      }
      point = match.end;
      if (selectionRange.containsPoint(point)) {
        ranges.push(match);
      }
    }
    if (ranges.length !== 0) {
      editor.setSelectedBufferRanges(ranges);
    }
  }
}

export function selectNext(editor: TextEditor, selector: Selector) {
  const buffer = editor.getBuffer();
  for (const selection of editor.getSelections()) {
    const range = selection.getBufferRange();
    const word = selector.matches(range, buffer)
      ? selector.next(range.end, buffer)
      : selector.next(range.start, buffer);
    if (word !== undefined) {
      selection.setBufferRange(word);
    }
  }
}

export function selectNextAfter(editor: TextEditor, selector: Selector) {
  const buffer = editor.getBuffer();
  for (const selection of editor.getSelections()) {
    const range = selection.getBufferRange();
    const word = selector.next(range.end, buffer);
    if (word !== undefined) {
      selection.setBufferRange(word);
    }
  }
}

export function selectPrevious(editor: TextEditor, selector: Selector) {
  const buffer = editor.getBuffer();
  for (const selection of editor.getSelections()) {
    const range = selection.getBufferRange();
    const word = selector.matches(range, buffer)
      ? selector.previous(range.start, buffer)
      : selector.previous(range.end, buffer);
    if (word !== undefined) {
      selection.setBufferRange(word);
    }
  }
}

export function selectPreviousAfter(editor: TextEditor, selector: Selector) {
  const buffer = editor.getBuffer();
  for (const selection of editor.getSelections()) {
    const range = selection.getBufferRange();
    const word = selector.previous(range.start, buffer);
    if (word !== undefined) {
      selection.setBufferRange(word);
    }
  }
}
