import { dedupeMixin } from '@lion/core';

// TODO: will be moved to @Lion/core later?

/**
 * @typedef {import('../../types/utils/SyncUpdatableMixinTypes').SyncUpdatableMixin} SyncUpdatableMixin
 * @typedef {import('../../types/utils/SyncUpdatableMixinTypes').SyncUpdatableNamespace} SyncUpdatableNamespace
 */

/**
 * Why this mixin?
 * - it adheres to the "Member Order Independence" web components standard:
 * https://github.com/webcomponents/gold-standard/wiki/Member-Order-Independence
 * - sync observers can be dependent on the outcome of the render function (or, more generically
 * speaking, the light and shadow dom). This aligns with the 'updated' callback that is supported
 * out of the box by LitElement, which runs after connectedCallback as well.
 * - makes the propertyAccessor.`hasChanged` compatible in synchronous updates:
 * `updateSync` will only be called when new value differs from old value.
 * See: https://lit-element.polymer-project.org/guide/lifecycle#haschanged
 * - it is a stable abstraction on top of a protected/non official lifecycle LitElement api.
 * Whenever the implementation of `requestUpdateInternal` changes (this happened in the past for
 * `requestUpdate`) we only have to change our abstraction instead of all our components
 * @type {SyncUpdatableMixin}
 * @param {import('@open-wc/dedupe-mixin').Constructor<import('@lion/core').LitElement>} superclass
 */
const SyncUpdatableMixinImplementation = superclass =>
  class extends superclass {
    constructor() {
      super();

      /**
       * Namespace for this mixin that guarantees naming clashes will not occur...
       * @type {SyncUpdatableNamespace}
       */
      this.__SyncUpdatableNamespace = {};
    }

    /**
     * Empty pending queue in order to guarantee order independence
     *
     * @param {import('lit-element').PropertyValues } changedProperties
     */
    firstUpdated(changedProperties) {
      super.firstUpdated(changedProperties);
      this.__syncUpdatableInitialize();
    }

    connectedCallback() {
      super.connectedCallback();
      this.__SyncUpdatableNamespace.connected = true;
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.__SyncUpdatableNamespace.connected = false;
    }

    /**
     * Makes the propertyAccessor.`hasChanged` compatible in synchronous updates
     * @param {string} name
     * @param {*} newValue
     * @param {*} oldValue
     * @private
     */
    static __syncUpdatableHasChanged(name, newValue, oldValue) {
      // @ts-expect-error [external]: accessing private lit property
      const properties = this._classProperties;
      if (properties.get(name) && properties.get(name).hasChanged) {
        return properties.get(name).hasChanged(newValue, oldValue);
      }
      return newValue !== oldValue;
    }

    /** @private */
    __syncUpdatableInitialize() {
      const ns = this.__SyncUpdatableNamespace;
      const ctor = /** @type {typeof SyncUpdatableMixin & typeof import('../../types/utils/SyncUpdatableMixinTypes').SyncUpdatableHost} */ (this
        .constructor);

      ns.initialized = true;
      // Empty queue...
      if (ns.queue) {
        Array.from(ns.queue).forEach(name => {
          // @ts-ignore [allow-private] in test
          if (ctor.__syncUpdatableHasChanged(name, this[name], undefined)) {
            this.updateSync(name, undefined);
          }
        });
      }
    }

    /**
     * @param {string} name
     * @param {*} oldValue
     */
    requestUpdateInternal(name, oldValue) {
      super.requestUpdateInternal(name, oldValue);

      this.__SyncUpdatableNamespace = this.__SyncUpdatableNamespace || {};
      const ns = this.__SyncUpdatableNamespace;

      const ctor = /** @type {typeof SyncUpdatableMixin & typeof import('../../types/utils/SyncUpdatableMixinTypes').SyncUpdatableHost} */ (this
        .constructor);
      // Before connectedCallback: queue
      if (!ns.initialized) {
        ns.queue = ns.queue || new Set();
        // Makes sure that we only initialize one time, with most up to date value
        ns.queue.add(name);
      } // After connectedCallback: guarded proxy to updateSync
      // @ts-ignore [allow-private] in test
      else if (ctor.__syncUpdatableHasChanged(name, this[name], oldValue)) {
        this.updateSync(name, oldValue);
      }
    }

    /**
     * An abstraction that has the exact same api as `requestUpdateInternal`, but taking
     * into account:
     * - [member order independence](https://github.com/webcomponents/gold-standard/wiki/Member-Order-Independence)
     * - property effects start when all (light) dom has initialized (on firstUpdated)
     * - property effects don't interrupt the first meaningful paint
     * - compatible with propertyAccessor.`hasChanged`: no manual checks needed or accidentally
     * run property effects / events when no change happened
     * effects when values didn't change
     * All code previously present in requestUpdateInternal can be placed in this method.
     * @param {string} name
     * @param {*} oldValue
     */
    updateSync(name, oldValue) {} // eslint-disable-line class-methods-use-this, no-unused-vars
  };

export const SyncUpdatableMixin = dedupeMixin(SyncUpdatableMixinImplementation);
