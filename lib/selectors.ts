import { Range, TextBuffer, Point } from "atom";

export interface Selector {
  statusbarName: string;
  matches(range: Range, buffer: TextBuffer): boolean;
  next(from: Point, buffer: TextBuffer): Range | undefined;
  previous(from: Point, buffer: TextBuffer): Range | undefined;
  delete(range: Range, buffer: TextBuffer): Range;
  expand(range: Range, buffer: TextBuffer): Range | undefined;
}

function nextMatchFrom(
  buffer: TextBuffer,
  reg: RegExp,
  from: Point
): Range | undefined {
  const { end } = buffer.getRange();
  let matchRange;
  buffer.scanInRange(reg, new Range(from, end), ({ range, stop, match }) => {
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
  first: RegExp,
  last: RegExp
): Selector {
  return {
    statusbarName,
    matches(range: Range, buffer: TextBuffer) {
      return match.test(buffer.getTextInRange(range));
    },
    next(from: Point, buffer: TextBuffer) {
      const firstLetter = nextMatchFrom(buffer, first, from);
      if (firstLetter === undefined) {
        return undefined;
      }
      const firstLetterPos = firstLetter.start;
      const word = nextMatchFrom(buffer, match, firstLetterPos);
      return word;
    },
    previous(from: Point, buffer: TextBuffer) {
      const wordEnd = previousMatchFrom(buffer, last, from);
      if (wordEnd === undefined) {
        return undefined;
      }
      const lastLetter = wordEnd.end;
      const word = previousMatchFrom(buffer, match, lastLetter);
      return word;
    },
    delete(range: Range, buffer: TextBuffer) {
      return range;
    },
    expand(range: Range, buffer: TextBuffer) {
      const firstChar = previousMatchFrom(buffer, first, range.start);
      if (firstChar === undefined) {
        return undefined;
      }
      const lastChar = nextMatchFrom(buffer, last, range.end);
      if (lastChar === undefined) {
        return undefined;
      }
      return new Range(firstChar.start, lastChar.end);
    }
  };
}

export const wordSelector = selectorFromRegExp(
  "Word",
  /\b(\w+|'+)\b/,
  /\W+\w/,
  /\w\W+/
);
export const charSelector = selectorFromRegExp("Char", /./, /./, /./);
export const lineSelector = {
  ...selectorFromRegExp("Line", /^[ \t]*(.*)$/m, /^[ \t]*./m, /.$/m),
  delete(range: Range, buffer: TextBuffer) {
    const { row } = range.start;
    return buffer.rangeForRow(row, true);
  }
};
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
  buffer.scanInRange(
    search,
    new Range(from, end),
    ({ range, matchText, stop }) => {
      if (left.test(matchText)) {
        depth++;
      } else if (right.test(matchText)) {
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

export const parenthesesSelector: Selector = {
  statusbarName: "()",
  matches(range: Range, buffer: TextBuffer) {
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
  },
  next(from: Point, buffer: TextBuffer) {
    const first = nextMatchFrom(buffer, /\(/, from);
    if (first === undefined) {
      return;
    }
    const matching = nextMatching(
      buffer,
      first.start.translate([0, 1]),
      /\(/g,
      /\)/
    );
    if (matching === undefined) {
      return;
    }
    return new Range(first.start, matching.end);
  },
  previous(from: Point, buffer: TextBuffer) {
    const first = previousMatchFrom(buffer, /\)/, from);
    if (first === undefined) {
      return;
    }
    const matching = previousMatching(
      buffer,
      first.end.translate([0, -1]),
      /\(/g,
      /\)/
    );
    if (matching === undefined) {
      return;
    }
    return new Range(matching.start, first.end);
  },
  delete(range: Range, _: TextBuffer) {
    return range;
  },
  expand(range: Range, buffer: TextBuffer) {
    const firstChar = previousMatchFrom(buffer, /\(/, range.start);
    if (firstChar === undefined) {
      return undefined;
    }
    const lastChar = nextMatchFrom(buffer, /\)/, range.end);
    if (lastChar === undefined) {
      return undefined;
    }
    return new Range(firstChar.start, lastChar.end);
  }
};
