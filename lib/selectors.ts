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
