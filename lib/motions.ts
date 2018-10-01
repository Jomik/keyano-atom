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

export const selectNext = mapSelections(({ buffer, selector, range }) => {
  const next = selector.matches(range, buffer)
    ? selector.next(range.end, buffer)
    : selector.next(range.start, buffer);
  return next !== undefined ? [next] : [];
});

export const selectNextAfter = mapSelections(({ buffer, selector, range }) => {
  const prev = selector.next(range.end, buffer);
  return prev !== undefined ? [prev] : [];
});

export const selectPrevious = mapSelections(({ buffer, selector, range }) => {
  const prev = selector.matches(range, buffer)
    ? selector.previous(range.start, buffer)
    : selector.previous(range.end, buffer);
  return prev !== undefined ? [prev] : [];
});

export const selectPreviousAfter = mapSelections(
  ({ buffer, selector, range }) => {
    const prev = selector.previous(range.start, buffer);
    return prev !== undefined ? [prev] : [];
  }
);
