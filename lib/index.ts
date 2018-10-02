import {
  CompositeDisposable,
  TextEditor,
  CommandEvent,
  TextEditorElement
} from "atom";
import * as S from "./selectors";
import * as M from "./motions";
import * as A from "./actions";

export let disposables = new CompositeDisposable();

export enum Command {
  Word = "keyano:set-selector-word",
  Line = "keyano:set-selector-line",
  Char = "keyano:set-selector-char",
  Parentheses = "keyano:set-selector-parentheses",
  next = "keyano:select-next",
  nextAfter = "keyano:select-next-after",
  prev = "keyano:select-previous",
  prevAfter = "keyano:select-previous-after",
  allIn = "keyano:select-all-in",
  delete = "keyano:delete-selections"
}

let editorSelector: WeakMap<TextEditor, S.Selector> = new WeakMap();
const defaultSelector = S.wordSelector;
const statusbarItem = document.createElement("span");

export function activate() {
  disposables.add(
    atom.config.observe("keyano.keyboardLayout", setKeymap),
    atom.config.observe("keyano.enabled", enableKeyano),

    atom.workspace.observeTextEditors((editor: TextEditor) => {
      const view = atom.views.getView(editor);
      if (atom.config.get("keyano.enabled")) {
        view.classList.add("keyano");
      }
      view.classList.add(atom.config.get("keyano.keyboardLayout"));
    }),
    atom.commands.add("atom-text-editor", {
      [Command.Char]: setSelector(S.charSelector),
      [Command.Word]: setSelector(S.wordSelector),
      [Command.Line]: setSelector(S.lineSelector),
      [Command.Parentheses]: setSelector(S.parenthesesSelector),
      [Command.next]: withEditorSelector(M.selectNext),
      [Command.nextAfter]: withEditorSelector(M.selectNextAfter),
      [Command.prev]: withEditorSelector(M.selectPrevious),
      [Command.prevAfter]: withEditorSelector(M.selectPreviousAfter),
      [Command.allIn]: withEditorSelector(M.selectAllIn),
      [Command.delete]: withEditorSelector(A.deleteSelections),
      "keyano:toggle": toggleKeyanoBindings
    })
  );
}

export function deactivate() {
  disposables.dispose();
  disposables = new CompositeDisposable();
  editorSelector = new WeakMap();
}

export function consumeStatusBar(statusbar: any) {
  statusbar.addLeftTile({ item: statusbarItem, priority: 0 });
}

const keymaps = [
  { value: "keymap-QWERTY", description: "Standard US QWERTY" },
  { value: "keymap-Colemak", description: "US Colemak" }
];
export const config = {
  enabled: {
    title: "Enable Keyano Keymap",
    description: "Enable Keyano Keymap (Meant for debugging)",
    type: "boolean",
    default: true
  },
  keyboardLayout: {
    title: "Keyboard Layout",
    description:
      "Use one of our predefined keymaps fitting your keyboard layout",
    type: "string",
    default: "keymap-QWERTY",
    enum: keymaps
  }
};

function setKeymap(value: string) {
  const editors = atom.workspace.getTextEditors();
  for (const e of editors) {
    const view = atom.views.getView(e);
    for (const map of keymaps) {
      view.classList.remove(map.value);
    }
    view.classList.add(value);
  }
}

function enableKeyano(enable: boolean) {
  const editors = atom.workspace.getTextEditors();
  for (const e of editors) {
    const view = atom.views.getView(e);
    view.classList.toggle("keyano", enable);
  }
}

function toggleKeyanoBindings() {
  atom.config.set("keyano.enabled", !atom.config.get("keyano.enabled"));
}

function setSelector(selector: S.Selector) {
  return (_: CommandEvent<TextEditorElement>) => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor !== undefined) {
      editorSelector.set(editor, selector);
      statusbarItem.innerText = selector.statusbarName;
    }
  };
}

function withEditorSelector(
  action: (editor: TextEditor, selector: S.Selector) => Promise<any> | void
) {
  return (_: CommandEvent<TextEditorElement>) => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor !== undefined) {
      const selector = editorSelector.get(editor) || defaultSelector;
      return action(editor, selector);
    }
  };
}
