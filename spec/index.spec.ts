import { assert } from "chai";
import { Range } from "atom";
import { testTextEditor, assertEqualTextEditors, packagePath } from "./helpers";

describe("Package", () => {
  beforeEach(() => atom.packages.activatePackage(packagePath));

  it("should activate keyano", async () => {
    assert.ok(atom.packages.isPackageActive("keyano"));
  });
});

describe("helpers", () => {
  describe("testTextEditor", () => {
    it("should set text without brackets", () => {
      const t1 = testTextEditor("ab[cdef]g");
      assert.equal(t1.getText(), "abcdefg");

      const t2 = testTextEditor("[abcdef]g");
      assert.equal(t2.getText(), "abcdefg");
    });

    it("should set selected range", () => {
      const t1 = testTextEditor("[abcdefg]");
      assert.deepEqual(t1.getSelectedBufferRanges(), [
        new Range([0, 0], [0, 7])
      ]);

      const t2 = testTextEditor("[abcde]fg");
      assert.deepEqual(t2.getSelectedScreenRanges(), [
        new Range([0, 0], [0, 5])
      ]);

      const t3 = testTextEditor("ab[c]defg");
      assert.deepEqual(t3.getSelectedScreenRanges(), [
        new Range([0, 2], [0, 3])
      ]);

      const text = `ab[cdefg
hijklmn]opqrstuvw`;
      const t4 = testTextEditor(text);
      assert.deepEqual(t4.getSelectedScreenRanges(), [
        new Range([0, 2], [1, 7])
      ]);
    });

    it("should set multiple selected ranges", () => {
      const t1 = testTextEditor("a[bc]de[fg]");
      assert.deepEqual(t1.getSelectedBufferRanges(), [
        new Range([0, 1], [0, 3]),
        new Range([0, 5], [0, 7])
      ]);

      const t2 = testTextEditor("[abc]d[efg]");
      assert.deepEqual(t2.getSelectedBufferRanges(), [
        new Range([0, 0], [0, 3]),
        new Range([0, 4], [0, 7])
      ]);
    });
  });

  describe("assertEqualTextEditors", () => {
    it("should be equal", () => {
      const t1 = testTextEditor("[abcdefg]");
      const t2 = testTextEditor("[abcdefg]");
      assertEqualTextEditors(t1, t2);
    });

    it("should not be equal", () => {
      const t1 = testTextEditor("[abcdefg]");
      const t2 = testTextEditor("[abc]defg");
      assert.throws(() => assertEqualTextEditors(t1, t2));
    });
  });
});
