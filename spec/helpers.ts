import { TextEditor, Range } from "atom";
import { assert } from "chai";
import { join } from "path";

export const packagePath = join(__dirname, "..");

export function createTextEditor(options?: any): TextEditor {
  // @ts-ignore
  return atom.workspace.buildTextEditor(options);
}

function parseBracketRanges(text: string) {
  let depth = 0;
  let line = 0;
  let column = 0;
  let start: [number, number][] = [];
  let ranges: Range[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    switch (c) {
      case "\n":
        line++;
        column = 0;
        break;
      case "[":
        start[depth] = [line, column];
        depth++;
        break;
      case "]":
        depth--;
        ranges.push(new Range(start[depth], [line, column]));
        break;
      default:
        column++;
        break;
    }
  }
  return ranges;
}

export function testTextEditor(text: string): TextEditor {
  const t = createTextEditor();
  const parsedText = text.replace("[", "").replace("]", "");
  t.setText(parsedText);
  const ranges = parseBracketRanges(text);
  t.setSelectedScreenRanges(ranges);
  return t;
}

function getTextEditorState(editor: TextEditor) {
  return {
    text: editor.getText(),
    selections: editor.getSelectedBufferRanges()
  };
}

export function assertEqualTextEditors(
  actual: TextEditor,
  expected: TextEditor
) {
  assert.deepEqual(getTextEditorState(actual), getTextEditorState(expected));
}
