import {
  CompositeDisposable,
  TextEditor,
  CommandEvent,
  TextEditorElement
} from "atom";
import { wordSelector } from "./selectors";
import { selectNext, selectPrevious } from "./motions";

export let disposables = new CompositeDisposable();

export function activate() {
  disposables.add(
    atom.workspace.observeTextEditors((editor: TextEditor) => {
      atom.views.getView(editor).classList.add("keyano");
    }),
    atom.commands.add("atom-text-editor", {
      "keyano:select-next-word": (_: CommandEvent<TextEditorElement>) => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor !== undefined) {
          selectNext(editor, wordSelector);
        }
      },
      "keyano:select-previous-word": (_: CommandEvent<TextEditorElement>) => {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor !== undefined) {
          selectPrevious(editor, wordSelector);
        }
      }
    })
  );
}

export function deactivate() {
  disposables.dispose();
  disposables = new CompositeDisposable();
}
