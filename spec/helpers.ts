import { TextEditor, Range } from "atom";
import { assert } from "chai";
import { join } from "path";
import { Command } from "../lib";

export const packagePath = join(__dirname, "..");

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

export async function testTextEditor(
  text: string,
  commands: Command[] = []
): Promise<TextEditor> {
  const t = await atom.workspace.open();
  const parsedText = text.replace("[", "").replace("]", "");
  t.setText(parsedText);
  const ranges = parseBracketRanges(text);
  t.setSelectedScreenRanges(ranges);
  for (const command of commands) {
    await atom.commands.dispatch((<any>t).element, command);
  }
  return t;
}

export function assertEqualTextEditors(actual: TextEditor, expected: string) {
  const parsedText = expected.replace("[", "").replace("]", "");
  assert.strictEqual(actual.getText(), parsedText);
  assert.sameDeepMembers(
    actual.getSelectedBufferRanges(),
    parseBracketRanges(expected),
    "Editor expected to have ranges"
  );
}
