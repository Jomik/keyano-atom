import { assert } from "chai";
import {
  testTextEditor,
  assertEqualTextEditors,
  packagePath,
  destroyAllTextEditors
} from "./helpers";
import { Command as C } from "../lib";

describe("motions", () => {
  before(() => atom.packages.activatePackage(packagePath));
  after(() => atom.packages.deactivatePackage("keyano"));

  describe("word", () => {
    describe("selectNext", () => {
      it("should select word after char", async () => {
        const editor = await testTextEditor("Lorem ip[s]um dolor sit amet", [
          C.Word,
          C.next
        ]);
        assertEqualTextEditors(editor, "Lorem ipsum [dolor] sit amet");
      });

      it("should select word after word", async () => {
        const editor = await testTextEditor("Lorem [ipsum] dolor sit amet", [
          C.Word,
          C.next
        ]);
        assertEqualTextEditors(editor, "Lorem ipsum [dolor] sit amet");
      });

      it("should select word on next line", async () => {
        const editor = await testTextEditor("Lorem ipsum [dolor] \nsit amet", [
          C.Word,
          C.next
        ]);
        assertEqualTextEditors(editor, "Lorem ipsum dolor \n[sit] amet");
      });
    });

    describe("selectPrevious", () => {
      it("should select word before char", async () => {
        const editor = await testTextEditor("Lorem ip[s]um dolor sit amet", [
          C.Word,
          C.prev
        ]);
        assertEqualTextEditors(editor, "[Lorem] ipsum dolor sit amet");
      });

      it("should select word before word", async () => {
        const editor = await testTextEditor("Lorem ipsum dolor sit [amet]", [
          C.Word,
          C.prev
        ]);
        assertEqualTextEditors(editor, "Lorem ipsum dolor [sit] amet");
      });

      it("should select word on previous line", async () => {
        const editor = await testTextEditor("Lorem ipsum dolor \n[sit] amet", [
          C.Word,
          C.prev
        ]);
        assertEqualTextEditors(editor, "Lorem ipsum [dolor] \nsit amet");
      });
    });
  });
  describe("line", () => {
    describe("selectNext", () => {
      it("should select line after char", async () => {
        const editor = await testTextEditor(
          `Lorem ipsum dolor sit amet, con[s]ectetur adipiscing elit. Pellentesque mauris
sem, ultrices imperdiet pretium non, pellentesque ut purus. Orci varius natoque
penatibus et magnis dis parturient montes, nascetur ridiculus mus.`,
          [C.Line, C.next]
        );
        assertEqualTextEditors(
          editor,
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mauris
[sem, ultrices imperdiet pretium non, pellentesque ut purus. Orci varius natoque]
penatibus et magnis dis parturient montes, nascetur ridiculus mus.`
        );
      });

      it("should select line after line", async () => {
        const editor = await testTextEditor(
          `[Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mauris]
sem, ultrices imperdiet pretium non, pellentesque ut purus. Orci varius natoque
penatibus et magnis dis parturient montes, nascetur ridiculus mus.`,
          [C.Line, C.next]
        );
        assertEqualTextEditors(
          editor,
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mauris
[sem, ultrices imperdiet pretium non, pellentesque ut purus. Orci varius natoque]
penatibus et magnis dis parturient montes, nascetur ridiculus mus.`
        );
      });
    });

    describe("selectPrevious", () => {
      it("should select line before char", async () => {
        const editor = await testTextEditor(
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mauris
sem, ultrices imperdiet pretium non, pellente[s]que ut purus. Orci varius natoque
penatibus et magnis dis parturient montes, nascetur ridiculus mus.`,
          [C.Line, C.prev]
        );
        assertEqualTextEditors(
          editor,
          `[Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mauris]
sem, ultrices imperdiet pretium non, pellentesque ut purus. Orci varius natoque
penatibus et magnis dis parturient montes, nascetur ridiculus mus.`
        );
      });

      it("should select line before line", async () => {
        const editor = await testTextEditor(
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mauris
[sem, ultrices imperdiet pretium non, pellentesque ut purus. Orci varius natoque]
penatibus et magnis dis parturient montes, nascetur ridiculus mus.`,
          [C.Line, C.prev]
        );
        assertEqualTextEditors(
          editor,
          `[Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mauris]
sem, ultrices imperdiet pretium non, pellentesque ut purus. Orci varius natoque
penatibus et magnis dis parturient montes, nascetur ridiculus mus.`
        );
      });
    });
  });
});
