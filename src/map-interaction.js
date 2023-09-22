// @ts-check

import { MapPlugin } from './map-plugin.js';

/** @typedef {import('./geojsonmap.js').ViewBox} ViewBox */

/**
 * @interface
 * @implements {MapPlugin<MapInteractionOptions>}
 */
export class MapInteraction extends MapPlugin {
  /**
   * @abstract
   * @param {Event} event
   * @param {ViewBox} viewBox
   * @returns {ViewBox}
   */
  viewBoxMapper(event, viewBox) {
    throw new Error('must be implemented by subclass!');
  }

  /**
   * @abstract
   * @param {MapInteractionOptions} options
   */
  initialize(options) {
    // nothing to do here
  }
}

/**
 * @typedef {Object} MapInteractionOptions
 */
