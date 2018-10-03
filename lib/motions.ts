import { TextEditor, TextBuffer, Range } from "atom";
import { Selector } from "./selectors";

function flatMap<A, B>(fn: (a: A) => B[], arr: A[]) {
  return arr.reduce<B[]>((acc, x) => acc.concat(fn(x)), []);
}

type MapSelectionsFnArg = {
  buffer: TextBuffer;
  selector: Selector;
  range: Range;
};
function mapSelections(
  fn: (
    { buffer: TextBuffer, selector: Selector, range: Range }: MapSelectionsFnArg
  ) => Range[]
) {
  return (editor: TextEditor, selector: Selector) => {
    const buffer = editor.getBuffer();
    const ranges = editor.getSelectedBufferRanges();
    const newRanges = flatMap(range => fn({ buffer, selector, range }), ranges);
    editor.setSelectedBufferRanges(newRanges);
  };
}

export const selectAllIn = mapSelections(({ buffer, selector, range }) => {
  let point = range.start;
  let ranges = [];
  while (range.containsPoint(point)) {
    const match = selector.next(point, buffer);
    if (match === undefined) {
      break;
    }
    point = match.end;
    if (range.containsPoint(point)) {
      ranges.push(match);
    }
  }
  return ranges;
});

type Args = {
  buffer: TextBuffer;
  selector: Selector;
  range: Range;
};

function add(fn: (a: Args) => Range[]) {
  return (args: Args) => {
    const { range } = args;
    return [range, ...fn(args)];
  };
}

function next({ buffer, selector, range }: Args) {
  const nxt = selector.matches(range, buffer)
    ? selector.next(range.end, buffer)
    : selector.next(range.start, buffer);
  return nxt !== undefined ? [nxt] : [];
}

function nextAfter({ buffer, selector, range }: Args) {
  const prev = selector.next(range.end, buffer);
  return prev !== undefined ? [prev] : [];
}

function previous({ buffer, selector, range }: Args) {
  const prev = selector.matches(range, buffer)
    ? selector.previous(range.start, buffer)
    : selector.previous(range.end, buffer);
  return prev !== undefined ? [prev] : [];
}

function previousAfter({ buffer, selector, range }: Args) {
  const prev = selector.previous(range.start, buffer);
  return prev !== undefined ? [prev] : [];
}

function expand({ buffer, selector, range }: Args) {
  const exp = selector.expand(range, buffer);
  return exp !== undefined ? [exp] : [];
}

export const selectExpand = mapSelections(expand);
export const selectNext = mapSelections(next);
export const selectNextAfter = mapSelections(nextAfter);
export const addNext = mapSelections(add(next));
export const addNextAfter = mapSelections(add(nextAfter));
export const selectPrevious = mapSelections(previous);
export const addPrevious = mapSelections(add(previous));
export const selectPreviousAfter = mapSelections(previousAfter);
export const addPreviousAfter = mapSelections(add(previousAfter));
