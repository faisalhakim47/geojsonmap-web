// @ts-check

/**
 * @template GeoJSONFeatureProps
 */
export class MapFeature {
  /** @type {SVGPathElement} */
  #path;

  /** @type {GeoJSONFeatureProps} */
  #properties;

  /**
   * @param {SVGPathElement} path
   * @param {GeoJSONFeatureProps} properties
   */
  constructor(path, properties) {
    this.#path = path;
    this.#properties = properties;
  }

  get properties() {
    return this.#properties;
  }

  /**
   * @param {string} color
   */
  fill(color) {
    this.#path.setAttribute('fill', color);
  }
}
