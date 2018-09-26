import { assert } from "chai";
import { testTextEditor, assertEqualTextEditors } from "./helpers";
import * as M from "../lib/motions";
import * as S from "../lib/selectors";

describe("motions", () => {
  describe("word", () => {
    describe("selectNext", () => {
      it("should select word after char", async () => {
        const editor = testTextEditor("Lorem ip[s]um dolor sit amet");
        M.selectNext(editor, S.wordSelector);
        assertEqualTextEditors(editor, "Lorem ipsum [dolor] sit amet");
      });

      it("should select word after word", async () => {
        const editor = testTextEditor("Lorem [ipsum] dolor sit amet");
        M.selectNext(editor, S.wordSelector);
        assertEqualTextEditors(editor, "Lorem ipsum [dolor] sit amet");
      });

      it("should select word on next line", async () => {
        const editor = testTextEditor("Lorem ipsum [dolor] \nsit amet");
        M.selectNext(editor, S.wordSelector);
        assertEqualTextEditors(editor, "Lorem ipsum dolor \n[sit] amet");
      });
    });

    describe("selectPrevious", () => {
      it("should select word before char", async () => {
        const editor = testTextEditor("Lorem ip[s]um dolor sit amet");
        M.selectPrevious(editor, S.wordSelector);
        assertEqualTextEditors(editor, "[Lorem] ipsum dolor sit amet");
      });

      it("should select word before word", async () => {
        const editor = testTextEditor("Lorem ipsum dolor sit [amet]");
        M.selectPrevious(editor, S.wordSelector);
        assertEqualTextEditors(editor, "Lorem ipsum dolor [sit] amet");
      });

      it("should select word on previous line", async () => {
        const editor = testTextEditor("Lorem ipsum dolor \n[sit] amet");
        M.selectPrevious(editor, S.wordSelector);
        assertEqualTextEditors(editor, "Lorem ipsum [dolor] \nsit amet");
      });
    });
  });
});
