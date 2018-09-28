import {
  CompositeDisposable,
  TextEditor,
  CommandEvent,
  TextEditorElement
} from "atom";
import { wordSelector, lineSelector, Selector } from "./selectors";
import { selectNext, selectPrevious } from "./motions";

export let disposables = new CompositeDisposable();

export enum Command {
  Word = "keyano:set-selector-word",
  Line = "keyano:set-selector-line",
  next = "keyano:select-next",
  prev = "keyano:select-previous"
}

let editorSelector: WeakMap<TextEditor, Selector> = new WeakMap();
const defaultSelector = wordSelector;

export function activate() {
  disposables.add(
    atom.workspace.observeTextEditors((editor: TextEditor) => {
      atom.views.getView(editor).classList.add("keyano");
    }),
    atom.commands.add("atom-text-editor", {
      [Command.Word]: setSelector(wordSelector),
      [Command.Line]: setSelector(lineSelector),
      [Command.next]: withEditorContext(selectNext),
      [Command.prev]: withEditorContext(selectPrevious),
      "keyano:toggle": toggleKeyanoBindings
    })
  );
}

export function deactivate() {
  disposables.dispose();
  disposables = new CompositeDisposable();
  editorSelector = new WeakMap();
}

function setSelector(selector: Selector) {
  return (_: CommandEvent<TextEditorElement>) => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor !== undefined) {
      editorSelector.set(editor, selector);
    }
  };
}

function withEditorContext(
  action: (editor: TextEditor, selector: Selector) => Promise<any> | void
) {
  return (_: CommandEvent<TextEditorElement>) => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor !== undefined) {
      const selector = editorSelector.get(editor) || defaultSelector;
      return action(editor, selector);
    }
  };
}

function toggleKeyanoBindings() {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor !== undefined) {
    atom.views.getView(editor).classList.toggle("keyano");
  }
}
