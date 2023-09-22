// @ts-check

/**
 * @template Payload
 */
export class EventEmitter {
  /**
   * @type {{ [eventName: string]: Set<(payload: Payload) => void> }}
   */
  #listeners = {};

  /**
   * @param {string} eventName
   * @param {(payload: Payload) => void} listener
   */
  on(eventName, listener) {
    if (this.#listeners[eventName] === undefined) {
      this.#listeners[eventName] = new Set();
    }
    this.#listeners[eventName].add(listener);
  }

  /**
   * @param {string} eventName
   * @param {(payload: Payload) => void} listener
   */
  off(eventName, listener) {
    if (this.#listeners[eventName] instanceof Set) {
      this.#listeners[eventName].delete(listener);
    }
  }

  /**
   * @param {string} eventName
   * @param {Payload} payload
   */
  emit(eventName, payload) {
    if (this.#listeners[eventName] instanceof Set) {
      this.#listeners[eventName].forEach((listener) => {
        listener(payload);
      });
    }
  }
}
