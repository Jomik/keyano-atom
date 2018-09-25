import {assert} from "chai";
import {join} from "path"

const packagePath = join(__dirname, "..")

describe("Package", () => {
  it("should activate keyano", async () => {
    await atom.packages.activatePackage(packagePath)
    assert.ok(atom.packages.isPackageActive("keyano"));
  });
});
