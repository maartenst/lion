import { OverlayMixin } from '@lion/overlays';
import { LitElement } from '@lion/core';
import { defineCE, fixture, expect } from '@open-wc/testing';
import { html, unsafeStatic } from 'lit/static-html';
import '@lion/listbox/define';
import '@lion/select-rich/define';

/**
 * @typedef {import('../src/LionSelectRich').LionSelectRich} LionSelectRich
 */

const tagString = defineCE(
  class extends OverlayMixin(LitElement) {
    render() {
      return html`
        <button slot="invoker">invoker button</button>
        <div id="overlay-content-node-wrapper">
          <div slot="content">content of the overlay</div>
        </div>
      `;
    }
  },
);
const tag = unsafeStatic(tagString);

describe('Select Rich Integration tests', () => {
  it('works inside a dialog', async () => {
    let properlyInstantiated = false;

    try {
      const nestedEl = /** @type {LionSelectRich} */ (
        await fixture(html`
          <lion-select-rich>
            <lion-options slot="input">
              <lion-option .choiceValue=${10}>Item 1</lion-option>
              <lion-option .choiceValue=${20}>Item 2</lion-option>
            </lion-options>
          </lion-select-rich>
        `)
      );
      await nestedEl.registrationComplete;

      await fixture(html`
        <${tag} id="main">
          <div slot="content" id="mainContent">
            open nested overlay:
            ${nestedEl}
          </div>
          <button slot="invoker">invoker button</button>
        </${tag}>
      `);
      properlyInstantiated = true;
    } catch (e) {
      throw new Error(e);
    }

    expect(properlyInstantiated).to.be.true;
  });
});
