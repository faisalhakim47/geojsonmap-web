// @ts-check

/** @typedef {import('./geojsonmap.js').GeoJsonMap} GeoJsonMap */
/** @typedef {import('./geojsonmap.js').ViewBox} ViewBox */

/**
 * @interface
 */
export class MapPlugin {
  /**
   * @abstract
   * @param {SVGSVGElement} svg
   */
  install(svg) {
    throw new Error('must be implemented by subclass!');
  }

  /**
   * @abstract
   */
  uninstall() {
    throw new Error('must be implemented by subclass!');
  }
}
