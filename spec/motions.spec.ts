import { assert } from "chai";
import { Range } from "atom";
import { testTextEditor, assertEqualTextEditors, packagePath } from "./helpers";
import * as M from "../lib/motions";
import * as S from "../lib/selectors";

describe("motions", () => {
  describe("word", () => {
    describe("selectNext", () => {
      it("should select word after char", async () => {
        const editor = testTextEditor("Lorem ip[s]um dolor sit amet");
        M.selectNext(editor, S.wordSelector);
        const expected = testTextEditor("Lorem ipsum [dolor] sit amet");
        assertEqualTextEditors(editor, expected);
      });

      it("should select word after word", async () => {
        const editor = testTextEditor("Lorem [ipsum] dolor sit amet");
        M.selectNext(editor, S.wordSelector);
        const expected = testTextEditor("Lorem ipsum [dolor] sit amet");
        assertEqualTextEditors(editor, expected);
      });

      it("should select word on next line", async () => {
        const editor = testTextEditor("Lorem ipsum [dolor] \nsit amet");
        M.selectNext(editor, S.wordSelector);
        const expected = testTextEditor("Lorem ipsum dolor \n[sit] amet");
        assertEqualTextEditors(editor, expected);
      });
    });
  });
});
