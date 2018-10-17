import { TextEditor, Range } from "atom";
import { Selector } from "./selectors";
import { nextFrom } from "./motions";

export function deleteSelections(editor: TextEditor, selector: Selector) {
  const buffer = editor.getBuffer();
  for (const s of editor.getSelections()) {
    const range = s.getBufferRange();
    const deleteRange = selector.delete(buffer, range);
    buffer.delete(deleteRange);
    // TODO: Should probably be "expand" instead
    const next = nextFrom(buffer, selector, deleteRange.start);
    if (next !== undefined) {
      s.setBufferRange(next);
    }
  }
}

export function pasteSelections(editor: TextEditor, selector: Selector) {
  const buffer = editor.getBuffer();
  saveExcursion(editor, () => {
    for (const s of editor.getSelections()) {
      const range = s.getBufferRange();
      const pasteRange = selector.paste(editor, range);
      s.setBufferRange(pasteRange);
    }
    editor.pasteText();
  });
}

function saveExcursion(editor: TextEditor, cb: () => void) {
  const selections = editor.getSelectedBufferRanges();
  cb();
  editor.setSelectedBufferRanges(selections);
}
