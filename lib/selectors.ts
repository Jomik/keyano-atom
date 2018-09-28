import { Range, TextBuffer, Point } from "atom";

export interface Selector {
  matches(range: Range, buffer: TextBuffer): boolean;
  next(from: Point, buffer: TextBuffer): Range | undefined;
  previous(from: Point, buffer: TextBuffer): Range | undefined;
}

export const wordSelector: Selector = {
  matches: (range: Range, buffer: TextBuffer) => {
    const wordRegex = /^\b(\w|')+\b$/i;
    return wordRegex.test(buffer.getTextInRange(range));
  },
  next: (from: Point, buffer: TextBuffer) => {
    const end = buffer.getRange().end;
    const wordStartRegex = /\W/i;
    const wordRegex = /\b(\w|')+\b/i;
    let wordStart: Point | undefined;
    buffer.scanInRange(wordStartRegex, new Range(from, end), ({ range }) => {
      wordStart = range.end.translate([0, -1]);
    });
    let word: Range | undefined;
    if (wordStart !== undefined) {
      buffer.scanInRange(wordRegex, new Range(wordStart, end), ({ range }) => {
        word = range;
      });
    }
    return word;
  },
  previous: (from: Point, buffer: TextBuffer) => {
    const start = buffer.getFirstPosition();
    const wordStartRegex = /\W/i;
    const wordRegex = /\b(\w|')+\b/i;
    let wordEnd: Point | undefined;
    buffer.backwardsScanInRange(
      wordStartRegex,
      new Range(start, from),
      ({ range }) => {
        wordEnd = range.end.translate([0, -1]);
      }
    );
    let word: Range | undefined;
    if (wordEnd !== undefined) {
      buffer.backwardsScanInRange(
        wordRegex,
        new Range(start, wordEnd),
        ({ range }) => {
          word = range;
        }
      );
    }
    return word;
  }
};

export const lineSelector: Selector = {
  matches: (range: Range, buffer: TextBuffer) => {
    return (
      range.start.row === range.end.row &&
      range.start.column === 0 &&
      range.end.column === buffer.lineLengthForRow(range.start.row)
    );
  },
  next: (from: Point, buffer: TextBuffer) => {
    const row = from.row + 1;
    if (row > buffer.getLastRow()) {
      return;
    }
    const length = buffer.lineLengthForRow(row);
    return new Range([row, 0], [row, length]);
  },
  previous: (from: Point, buffer: TextBuffer) => {
    const row = from.row - 1;
    if (row < 0) {
      return;
    }
    const length = buffer.lineLengthForRow(row);
    return new Range([row, 0], [row, length]);
  }
};

export const parenthesesSelector: Selector = {
  matches: (range: Range, buffer: TextBuffer) => {
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
  next: (from: Point, buffer: TextBuffer) => {
    const end = buffer.getEndPosition();

    let start: Point | undefined;
    buffer.scanInRange(/\(/, new Range(from, end), ({ range }) => {
      start = range.start;
    });
    if (start === undefined) {
      return;
    }
    let depth = 0;
    let matchingEnd: Point | undefined;
    buffer.scanInRange(
      /[\(\)]/g,
      new Range(start.translate([0, 1]), end),
      ({ range, matchText }) => {
        switch (matchText) {
          case ")":
            if (depth === 0 && matchingEnd === undefined) {
              matchingEnd = range.end;
            }
            depth--;
            break;
          case "(":
            depth++;
            break;
        }
      }
    );
    if (matchingEnd === undefined) {
      return;
    }
    return new Range(start, matchingEnd);
  },
  previous: (from: Point, buffer: TextBuffer) => {
    let end: Point | undefined;
    buffer.backwardsScanInRange(/\)/, new Range([0, 0], from), ({ range }) => {
      end = range.end;
    });
    if (end === undefined) {
      return;
    }
    let depth = 0;
    let matchingStart: Point | undefined;
    buffer.backwardsScanInRange(
      /[\(\)]/g,
      new Range([0, 0], end.translate([0, -1])),
      ({ range, matchText }) => {
        switch (matchText) {
          case "(":
            if (depth === 0 && matchingStart === undefined) {
              matchingStart = range.start;
            }
            depth--;
            break;
          case ")":
            depth++;
            break;
        }
      }
    );
    if (matchingStart === undefined) {
      return;
    }
    return new Range(matchingStart, end);
  }
};
