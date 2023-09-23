// @ts-check

import { MapPlugin } from './map-plugin.js';

/** @typedef {import('./geojsonmap.js').ViewBox} ViewBox */

/**
 * @interface
 * @implements {MapPlugin}
 */
export class MapInteraction extends MapPlugin {
  /**
   * @protected
   * @type {SVGSVGElement|undefined}
   */
  _svg;

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
   * @param {SVGSVGElement} svg
   */
  install(svg) {
    this._svg = svg;
  }

  uninstall() {
    this._svg = undefined;
  }
}

/**
 * @typedef {Object} MapInteractionOptions
 */
