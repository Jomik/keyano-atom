import { Range, TextBuffer, TextEditor, Point } from "atom";

export interface Selector {
  statusbarName: string;
  matches(buffer: TextBuffer, range: Range): boolean;
  nextLeft(buffer: TextBuffer, from: Point): Range | undefined;
  nextRight(buffer: TextBuffer, from: Point): Range | undefined;
  prevLeft(buffer: TextBuffer, from: Point): Range | undefined;
  prevRight(buffer: TextBuffer, from: Point): Range | undefined;
  findMatchingLeft(buffer: TextBuffer, right: Range): Range | undefined;
  findMatchingRight(buffer: TextBuffer, left: Range): Range | undefined;
  delete(buffer: TextBuffer, range: Range): Range;
  paste(editor: TextEditor, range: Range): Range;
}

function orRegExp(r1: RegExp, r2: RegExp) {
  const flags = (r1.flags + r2.flags)
    .split("")
    .sort()
    .join("")
    .replace(/(.)(?=.*\1)/g, "");
  return new RegExp("[" + r1.source + r2.source + "]", flags);
}

function nextMatching(
  buffer: TextBuffer,
  from: Point,
  left: RegExp,
  right: RegExp
) {
  const end = buffer.getEndPosition();
  const search = orRegExp(left, right);
  let depth = 0;
  let match: Range | undefined;
  console.groupCollapsed("nextMatching");
  buffer.scanInRange(
    search,
    new Range(from, end),
    ({ range, matchText, stop }) => {
      const isRight = right.test(matchText.toString());
      const isLeft = left.test(matchText.toString());
      console.info({
        range,
        matchText,
        isRight,
        isLeft,
        depth
      });
      if (isRight) {
        if (depth === 0) {
          match = range;
          stop();
        }
        depth--;
      } else if (isLeft) {
        depth++;
      } else {
        console.log("Else???", matchText);
      }
    }
  );
  console.groupEnd();
  return match;
}

function previousMatching(
  buffer: TextBuffer,
  from: Point,
  left: RegExp,
  right: RegExp
) {
  const search = orRegExp(left, right);
  let depth = 0;
  let match: Range | undefined;
  buffer.backwardsScanInRange(
    search,
    new Range([0, 0], from),
    ({ range, matchText, stop }) => {
      if (right.test(matchText)) {
        depth++;
      } else if (left.test(matchText)) {
        if (depth === 0) {
          match = range;
          stop();
        }
        depth--;
      }
    }
  );
  return match;
}

function nextMatchFrom(
  buffer: TextBuffer,
  reg: RegExp,
  from: Point
): Range | undefined {
  const { end } = buffer.getRange();
  let matchRange;
  buffer.scanInRange(reg, new Range(from, end), ({ range, stop, match }) => {
    if (match[1] !== undefined) {
      const r = match[0].indexOf(match[1]);
      const e = match[0].length - match[1].length - r;
      matchRange = new Range(
        range.start.translate([0, r]),
        range.end.translate([0, -e])
      );
    } else {
      matchRange = range;
    }
    stop();
  });
  return matchRange;
}

function previousMatchFrom(
  buffer: TextBuffer,
  reg: RegExp,
  from: Point
): Range | undefined {
  const { start } = buffer.getRange();
  let matchRange;
  buffer.backwardsScanInRange(
    reg,
    new Range(start, from),
    ({ range, stop, match }) => {
      if (match[1]) {
        const r = match[0].indexOf(match[1]);
        const e = match[0].length - match[1].length - r;
        matchRange = new Range(
          range.start.translate([0, r]),
          range.end.translate([0, -e])
        );
      } else {
        matchRange = range;
      }
      stop();
    }
  );
  return matchRange;
}

function selectorFromRegExp(
  statusbarName: string,
  match: RegExp,
  left: RegExp,
  right: RegExp
): Selector {
  return {
    statusbarName,
    matches(buffer: TextBuffer, range: Range) {
      return match.test(buffer.getTextInRange(range));
    },
    nextLeft(buffer: TextBuffer, from: Point) {
      return nextMatchFrom(buffer, left, from);
    },
    nextRight(buffer: TextBuffer, from: Point) {
      return nextMatchFrom(buffer, right, from);
    },
    prevLeft(buffer: TextBuffer, from: Point) {
      return previousMatchFrom(buffer, left, from);
    },
    prevRight(buffer: TextBuffer, from: Point) {
      return previousMatchFrom(buffer, right, from);
    },
    findMatchingLeft(buffer: TextBuffer, match: Range) {
      return previousMatching(buffer, match.start, left, right);
    },
    findMatchingRight(buffer: TextBuffer, match: Range) {
      return nextMatching(buffer, match.end, left, right);
    },
    delete(_buffer: TextBuffer, range: Range) {
      return range;
    },
    paste(_buffer: TextEditor, range: Range) {
      return new Range(range.end, range.end);
    }
  };
}

export const wordSelector = {
  ...selectorFromRegExp("Word", /\b(\w+|'+)\b/, /\b(\w)/, /(\w)\b/),
  findMatchingLeft(buffer: TextBuffer, match: Range) {
    const b = previousMatchFrom(buffer, /\W/, match.end);
    if (b === undefined) {
      return undefined;
    }
    return b.translate([0, 1]);
  },
  findMatchingRight(buffer: TextBuffer, match: Range) {
    const b = nextMatchFrom(buffer, /\W/, match.start);
    if (b === undefined) {
      return undefined;
    }
    return b.translate([0, -1]);
  }
};

export const charSelector = selectorFromRegExp("Char", /./, /./, /./);
export const numberSelector = selectorFromRegExp(
  "Number",
  /[0-9]+(?:\.[0-9]+)?/,
  /[0-9]/,
  /[0-9]/
);
export const lineSelector = {
  ...selectorFromRegExp("Line", /^[ \t]*(.*)$/m, /^[ \t]*./m, /.$/m),
  nextLeft(buffer: TextBuffer, from: Point) {
    const row = from.row + 1;
    const text = buffer.lineForRow(row);
    if (text === undefined) {
      return undefined;
    }
    const indentation = (<string[]>text.match(/^[ \t]*/m))[0];
    return new Range([row, indentation.length], [row, indentation.length]);
  },
  findMatchingLeft(buffer: TextBuffer, match: Range) {
    return this.nextLeft(buffer, match.start.translate([-1, 0]));
  },
  findMatchingRight(buffer: TextBuffer, match: Range) {
    const { row } = match.end;
    const length = buffer.lineLengthForRow(row);
    return new Range([row, length], [row, length]);
  },
  delete(buffer: TextBuffer, range: Range) {
    const { row } = range.start;
    return buffer.rangeForRow(row, true);
  },
  paste(editor: TextEditor, range: Range) {
    const buffer = editor.getBuffer();
    const { row } = range.end;
    const column = buffer.lineLengthForRow(row);
    buffer.insert([row, column], "\n");
    // @ts-ignore
    const identation = editor.indentationForBufferRow(row);
    editor.setIndentationForBufferRow(row + 1, identation);
    const length = buffer.lineLengthForRow(row + 1);
    const point = new Point(row + 1, length);
    return new Range(point, point);
  }
};

export const parenthesesSelector: Selector = {
  ...selectorFromRegExp("()", /\(\)/, /\(/g, /\)/g),
  matches(buffer: TextBuffer, range: Range) {
    const text = buffer.getTextInRange(range);
    if (text.length < 2 || text[0] !== "(" || text[text.length - 1] !== ")") {
      return false;
    }
    let depth = 0;
    for (const c of text) {
      switch (c) {
        case "(":
          depth++;
          break;
        case ")":
          depth--;
          break;
      }
    }
    return depth === 0;
  }
};
