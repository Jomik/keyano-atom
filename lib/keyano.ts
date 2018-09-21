import { TextEditor, CompositeDisposable } from "atom";
import { disposables } from "./";

export class KeyanoState {
  private disposables: CompositeDisposable = new CompositeDisposable();

  constructor(private editor: TextEditor) {
    disposables.add(this.disposables);
  }
}
