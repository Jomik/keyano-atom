import { CompositeDisposable, TextEditor } from "atom";
import { KeyanoState } from "./keyano";

export const disposables = new CompositeDisposable();

const keyanoStates: { [id: number]: KeyanoState } = {};
type State = {};

export function activate(state: State) {
  console.log("Activated Keyano");
  disposables.add(
    atom.workspace.observeTextEditors((editor: TextEditor) => {
      keyanoStates[editor.id] = new KeyanoState(editor);
    })
  );
}

export function deactivate() {
  disposables.dispose();
}

export function serialize(): String {
  return "{}";
}
