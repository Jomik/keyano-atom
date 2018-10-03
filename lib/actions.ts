import { TextEditor, Range } from "atom";
import { Selector } from "./selectors";

export function deleteSelections(editor: TextEditor, selector: Selector) {
  const buffer = editor.getBuffer();
  for (const s of editor.getSelections()) {
    const range = s.getBufferRange();
    const deleteRange = selector.delete(range, buffer);
    buffer.delete(deleteRange);
    // TODO: Should probably be "expand" instead
    const next = selector.next(deleteRange.start, buffer);
    if (next !== undefined) {
      s.setBufferRange(next);
    }
  }
}
