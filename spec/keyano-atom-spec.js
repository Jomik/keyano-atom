'use babel';

import KeyanoAtom from '../lib/keyano-atom';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('KeyanoAtom', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('keyano-atom');
  });

  describe('when the keyano-atom:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.keyano-atom')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'keyano-atom:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.keyano-atom')).toExist();

        let keyanoAtomElement = workspaceElement.querySelector('.keyano-atom');
        expect(keyanoAtomElement).toExist();

        let keyanoAtomPanel = atom.workspace.panelForItem(keyanoAtomElement);
        expect(keyanoAtomPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'keyano-atom:toggle');
        expect(keyanoAtomPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.keyano-atom')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'keyano-atom:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let keyanoAtomElement = workspaceElement.querySelector('.keyano-atom');
        expect(keyanoAtomElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'keyano-atom:toggle');
        expect(keyanoAtomElement).not.toBeVisible();
      });
    });
  });
});
