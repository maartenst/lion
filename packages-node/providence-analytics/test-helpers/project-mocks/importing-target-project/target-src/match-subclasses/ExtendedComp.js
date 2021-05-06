/* eslint-disable */

import { RefClass } from 'exporting-ref-project';
import MyCompMixin from './internalProxy.js';

export class ExtendedComp extends MyCompMixin(RefClass) {
  /**
   * allowed members
   */
  get getterSetter() {}
  set getterSetter(v) {}
  static get staticGetterSetter() {}
  static set staticGetterSetter(v) {}
  method() {}
  _protectedMethod() {}
  __privateMethod() {}
  $protectedMethod() {}
  $$privateMethod() {}

  /**
   * Blacklisted platform methods ands props by find-classes
   */
  static get attributes() {}
  constructor() {}
  connectedCallback() {}
  disconnectedCallback() {}
  /**
   * Blacklisted LitElement methods ands props by find-classes
   */
  static get properties() {}
  static get styles() {}
  get updateComplete() {}
  requestUpdate() {}
  createRenderRoot() {}
  render() {}
  updated() {}
  firstUpdated() {}
  update() {}
  shouldUpdate() {}
  /**
   * Blacklisted Lion methods and props by find-classes
   */
  static get localizeNamespaces() {}
  get slots() {}
  onLocaleUpdated() {}
}
