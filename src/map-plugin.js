// @ts-check

/** @typedef {import('./geojson-map').ViewBox} ViewBox */

/**
 * @interface
 * @template MapPluginOptions
 */
export class MapPlugin {
  /**
   * @protected
   * @type {SVGSVGElement}
   */
  _svg;
  
  /**
   * @param {SVGSVGElement} svg
   */
  constructor(svg) {
    this._svg = svg;
  }

  /**
   * @abstract
   * @param {MapPluginOptions} [options]
   */
  initialize(options) {
    throw new Error('must be implemented by subclass!');
  }
}
