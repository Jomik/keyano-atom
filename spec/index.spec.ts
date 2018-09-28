import { assert } from "chai";
import { Range } from "atom";
import { testTextEditor, assertEqualTextEditors, packagePath } from "./helpers";

describe("Package", () => {
  before(() => atom.packages.activatePackage(packagePath));
  after(() => atom.packages.deactivatePackage("keyano"));

  it("should activate keyano", async () => {
    assert.ok(atom.packages.isPackageActive("keyano"));
  });
});

describe("helpers", () => {
  describe("testTextEditor", () => {
    it("should set text without brackets", async () => {
      const t1 = await testTextEditor("ab[cdef]g");
      assert.equal(t1.getText(), "abcdefg");

      const t2 = await testTextEditor("[abcdef]g");
      assert.equal(t2.getText(), "abcdefg");
    });

    it("should set selected range", async () => {
      const t1 = await testTextEditor("[abcdefg]");
      assert.deepEqual(t1.getSelectedBufferRanges(), [
        new Range([0, 0], [0, 7])
      ]);

      const t2 = await testTextEditor("[abcde]fg");
      assert.deepEqual(t2.getSelectedScreenRanges(), [
        new Range([0, 0], [0, 5])
      ]);

      const t3 = await testTextEditor("ab[c]defg");
      assert.deepEqual(t3.getSelectedScreenRanges(), [
        new Range([0, 2], [0, 3])
      ]);

      const text = `ab[cdefg
hijklmn]opqrstuvw`;
      const t4 = await testTextEditor(text);
      assert.deepEqual(t4.getSelectedScreenRanges(), [
        new Range([0, 2], [1, 7])
      ]);
    });

    it("should set multiple selected ranges", async () => {
      const t1 = await testTextEditor("a[bc]de[fg]");
      assert.deepEqual(t1.getSelectedBufferRanges(), [
        new Range([0, 1], [0, 3]),
        new Range([0, 5], [0, 7])
      ]);

      const t2 = await testTextEditor("[abc]d[efg]");
      assert.deepEqual(t2.getSelectedBufferRanges(), [
        new Range([0, 0], [0, 3]),
        new Range([0, 4], [0, 7])
      ]);
    });
  });

  describe("assertEqualTextEditors", () => {
    it("should be equal", async () => {
      const t = await testTextEditor("[abcdefg]");
      assertEqualTextEditors(t, "[abcdefg]");
    });

    it("should not be equal on different selections", async () => {
      const t = await testTextEditor("[abcdefg]");
      assert.throws(() => assertEqualTextEditors(t, "[abc]defg"));
    });

    it("should not be equal on different text", async () => {
      const t = await testTextEditor("[abcdefg]");
      assert.throws(() => assertEqualTextEditors(t, "[abcdeff]"));
    });
  });
});
