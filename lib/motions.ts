import { TextEditor, TextBuffer, Range, Point } from "atom";
import { Selector } from "./selectors";

function flatMap<A, B>(fn: (a: A) => B[], arr: A[]) {
  return arr.reduce<B[]>((acc, x) => acc.concat(fn(x)), []);
}

type Args = {
  buffer: TextBuffer;
  selector: Selector;
  range: Range;
};

function mapSelections(
  fn: (
    { buffer: TextBuffer, selector: Selector, range: Range }: Args
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
    const match = nextFrom(buffer, selector, point);
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

function add(fn: (a: Args) => Range[]) {
  return (args: Args) => {
    const { range } = args;
    return [range, ...fn(args)];
  };
}
export function nextFrom(
  buffer: TextBuffer,
  selector: Selector,
  from: Point
): Range | undefined {
  const left = selector.nextLeft(buffer, from);
  if (left === undefined) {
    atom.notifications.addInfo("No left bound found");
    return undefined;
  }
  const right = selector.findMatchingRight(buffer, left);
  if (right === undefined) {
    atom.notifications.addInfo("No matching right bound found");
    return undefined;
  }
  return new Range(left.start, right.end);
}

function previousFrom(buffer: TextBuffer, selector: Selector, from: Point) {
  const right = selector.prevRight(buffer, from);
  if (right === undefined) {
    atom.notifications.addInfo("No right bound found");
    return undefined;
  }
  const left = selector.findMatchingLeft(buffer, right);
  if (left === undefined) {
    atom.notifications.addInfo("No matching left bound found");
    return undefined;
  }
  return new Range(left.start, right.end);
}

function next({ buffer, selector, range }: Args) {
  const nxt = selector.matches(buffer, range)
    ? nextFrom(buffer, selector, range.end)
    : nextFrom(buffer, selector, range.start);
  return nxt !== undefined ? [nxt] : [];
}

function nextAfter({ buffer, selector, range }: Args) {
  const n = nextFrom(buffer, selector, range.end);
  return n !== undefined ? [n] : [];
}

function previous({ buffer, selector, range }: Args) {
  const prev = selector.matches(buffer, range)
    ? previousFrom(buffer, selector, range.start)
    : previousFrom(buffer, selector, range.end);
  return prev !== undefined ? [prev] : [];
}

function previousAfter({ buffer, selector, range }: Args) {
  const prev = previousFrom(buffer, selector, range.start);
  return prev !== undefined ? [prev] : [];
}

function middlePoint(range: Range): Point {
  const row = Math.floor((range.start.row + range.end.row) / 2);
  const column = Math.floor((range.start.column + range.end.column) / 2);
  return new Point(row, column);
}

function expand({ buffer, selector, range }: Args) {
  const right = selector.nextRight(buffer, middlePoint(range));
  if (right === undefined) {
    return;
  }
  const left = selector.findMatchingLeft(buffer, right);
  if (left === undefined) {
    return;
  }
  return new Range(left.start, right.end);
}

export const up = mapSelections(({ range, ...rest }: Args) => {
  const above = range.translate([-1, 0]);
  const e = expand({ ...rest, range: above });
  return e !== undefined ? [e] : [];
});

export const down = mapSelections(({ range, ...rest }: Args) => {
  const below = range.translate([1, 0]);
  const e = expand({ ...rest, range: below });
  return e !== undefined ? [e] : [];
});

export const selectExpand = mapSelections(expand);
export const selectNext = mapSelections(next);
export const selectNextAfter = mapSelections(nextAfter);
export const addNext = mapSelections(add(next));
export const addNextAfter = mapSelections(add(nextAfter));
export const selectPrevious = mapSelections(previous);
export const addPrevious = mapSelections(add(previous));
export const selectPreviousAfter = mapSelections(previousAfter);
export const addPreviousAfter = mapSelections(add(previousAfter));
