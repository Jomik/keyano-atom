'use babel';

import KeyanoAtomView from './keyano-atom-view';
import { CompositeDisposable } from 'atom';

export default {

  keyanoAtomView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.keyanoAtomView = new KeyanoAtomView(state.keyanoAtomViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.keyanoAtomView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'keyano-atom:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.keyanoAtomView.destroy();
  },

  serialize() {
    return {
      keyanoAtomViewState: this.keyanoAtomView.serialize()
    };
  },

  toggle() {
    console.log('KeyanoAtom was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
