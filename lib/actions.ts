import { TextEditor, Range } from "atom";
import { Selector } from "./selectors";

export function deleteSelections(editor: TextEditor, selector: Selector) {
  for (const selection of editor.getSelections()) {
    selection.delete();
  }
}
