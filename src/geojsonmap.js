// @ts-check

import { EventEmitter } from './event-emitter.js';
import { MapFeature } from './map-feature.js';
import { MapInteraction } from './map-interaction.js';
import { MapPlugin } from './map-plugin.js';

/** @typedef {import('geojson').Geometry} Geometry */
/** @typedef {import('geojson').MultiPolygon} MultiPolygon */
/** @typedef {import('geojson').Polygon} Polygon */
/** @typedef {import('geojson').Position} Position */

/**
 * @template Geom
 * @typedef {import('geojson').GeometryCollection} GeometryCollection
 */

/**
 * @template Geom
 * @template Prop
 * @typedef {import('geojson').FeatureCollection<Geom & Geometry, Prop>} FeatureCollection
 */

/**
 * @template GeoJSONFeatureProps
 */
export class GeoJsonMap extends EventEmitter {
  /** @type {Element|undefined} */
  #attachedElement;

  /** @type {SVGSVGElement|undefined} */
  #svg;

  /** @type {FeatureCollection<MultiPolygon|Polygon, GeoJSONFeatureProps>} */
  #geojson = {
    type: 'FeatureCollection',
    features: [],
  };

  /** @type {number|'inherit'} */
  #initialWidth;

  /** @type {number|'inherit'} */
  #initialHeight;

  /** @type {((MapFeature: MapFeature<GeoJSONFeatureProps>) => string)|undefined} */
  #initialFill = undefined;

  /** @type {Array<MapFeature>} */
  #mapFeatures = [];

  /** @type {Array<MapInteraction>} */
  #interactions = [];

  /** @type {Array<MapPlugin>} */
  #plugins = [];

  /**
   * @param {GeoJsonMapOptions<GeoJSONFeatureProps>} [options]
   */
  constructor(options = {}) {
    super();

    const initialWidth = options?.initialWidth;
    const initialHeight = options?.initialHeight;
    const initialFill = options?.initialFill;

    if (typeof initialWidth === 'number') {
      this.#initialWidth = initialWidth;
    }
    if (typeof initialHeight === 'number') {
      this.#initialHeight = initialHeight;
    }
    if (typeof initialFill === 'string') {
      this.#initialFill = function () {
        return initialFill;
      };
    }
    else if (typeof initialFill === 'function') {
      this.#initialFill = initialFill;
    }
  }

  /**
   * @param {FeatureCollection<MultiPolygon|Polygon, GeoJSONFeatureProps>} geoJson
   */
  add(geoJson) {
    if (geoJson.type !== 'FeatureCollection') {
      throw new Error('Only FeatureCollection is supported');
    }

    this.#geojson.features.push(...geoJson.features);
  }

  /**
   * @param {MapPlugin} plugin
   */
  use(plugin) {
    if (plugin instanceof MapInteraction) {
      this.#interactions.push(plugin);
    }
    if (plugin instanceof MapPlugin) {
      this.#plugins.push(plugin);
    }
  }

  /**
   * @param {(mapFeature: MapFeature<GeoJSONFeatureProps>) => void} fn
   */
  forEach(fn) {
    for (const mapFeature of this.#mapFeatures) {
      fn(mapFeature);
    }
  }

  /**
   * @param {Element} element
   */
  attachTo(element) {
    if (!(element instanceof Element)) {
      throw new Error('node must be an instance of Node!');
    }

    const svg = this.#geoJsonToSVGElement(this.#geojson);

    for (const plugin of this.#plugins) {
      plugin.install(svg);
    }

    const initialHeight = this.#initialHeight === 'inherit'
      ? element.clientHeight
      : this.#initialHeight;
    const initialWidth = this.#initialWidth === 'inherit'
      ? element.clientWidth
      : this.#initialWidth;

    if (typeof initialHeight === 'number') {
      svg.setAttribute('height', initialHeight.toString());
    }
    if (typeof initialWidth === 'number') {
      svg.setAttribute('width', initialWidth.toString());
    }

    element.appendChild(svg);
    this.#attachedElement = element;
  }

  destroy() {
    if (!(this.#attachedElement instanceof Element)) {
      throw new Error('map is not attached to any element!');
    }

    if (!(this.#svg instanceof SVGSVGElement)) {
      throw new Error('svg is not initialized!');
    }

    for (const plugin of this.#plugins) {
      plugin.uninstall();
    }

    this.#attachedElement.removeChild(this.#svg);

    this.#svg = undefined;
    this.#attachedElement = undefined;
  }

  /**
   * @param {FeatureCollection<MultiPolygon|Polygon, GeoJSONFeatureProps>} featureCollection 
   */
  #geoJsonToSVGElement(featureCollection) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const rect = this.#getBoundingRectFromGeoJSON(featureCollection);

    const coordWidth = rect.right - rect.left;
    const coordHeight = rect.top - rect.bottom;

    const width = coordWidth;
    const height = coordHeight;

    svg.setAttribute('viewBox', `${rect.left} ${rect.bottom} ${width} ${height}`);

    if (featureCollection.type === 'FeatureCollection') {
      for (const feature of featureCollection.features) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const mapFeature = new MapFeature(path, feature.properties)
        if (typeof this.#initialFill === 'function') {
          path.setAttribute('fill', this.#initialFill(mapFeature));
        }
        if (feature.type === 'Feature') {
          if (feature.geometry.type === 'MultiPolygon') {
            path.setAttribute('d', this.#multiPolygonToSVGPath(feature.geometry));
          }
          else if (feature.geometry.type === 'Polygon') {
            path.setAttribute('d', this.#polygonToSVGPath(feature.geometry));
          }
        }
        path.addEventListener('click', () => this.emit('feature:click', mapFeature));
        path.addEventListener('dblclick', () => this.emit('feature:dblclick', mapFeature));
        path.addEventListener('mouseenter', () => this.emit('feature:mouseenter', mapFeature));
        path.addEventListener('mouseleave', () => this.emit('feature:mouseleave', mapFeature));
        this.#mapFeatures.push(mapFeature);
        svg.appendChild(path);
      }
    }

    

    return svg;
  }

  /**
   * @param {SVGSVGElement} svg
   * @param {MapInteraction} interaction
   */
  #attachInteraction(svg, interaction) {
    /**
     * @param {Event} event
     */
    const bindedViewBoxHandler = (event) => {
      this.#viewBoxHandler(event);
    };
    svg.addEventListener('wheel', bindedViewBoxHandler);
    svg.addEventListener('mouseenter', bindedViewBoxHandler);
    svg.addEventListener('mouseleave', bindedViewBoxHandler);
    svg.addEventListener('mousemove', bindedViewBoxHandler);
  }

  /**
   * @param {Event} event
   */
  #viewBoxHandler(event) {
    /** @type {ViewBox} */
    const initialViewBox = this.#svg?.viewBox.baseVal ?? {
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    };
    const mappedViewBox = this.#interactions
      .reduce((viewBox, interaction) => {
        return interaction.viewBoxMapper(event, viewBox);
      }, initialViewBox);
    if (
      mappedViewBox.x !== initialViewBox.x
      || mappedViewBox.y !== initialViewBox.y
      || mappedViewBox.width !== initialViewBox.width
      || mappedViewBox.height !== initialViewBox.height
    ) {
      requestAnimationFrame(() => {
        this.#svg?.setAttribute('viewBox', `${mappedViewBox.x} ${mappedViewBox.y} ${mappedViewBox.width} ${mappedViewBox.height}`);
      });
    }
  }

  /**
   * @param {MultiPolygon} multiPolygon
   * @returns {string}
   */
  #multiPolygonToSVGPath(multiPolygon) {
    const paths = [];
    for (const polygon of multiPolygon.coordinates) {
      for (const ring of polygon) {
        paths.push(this.#ringToSVGPath(ring));
      }
    }
    return paths.join(' ');
  }

  /**
   * @param {Polygon} polygon
   * @returns {string}
   */
  #polygonToSVGPath(polygon) {
    const paths = [];
    for (const ring of polygon.coordinates) {
      paths.push(this.#ringToSVGPath(ring));
    }
    return paths.join(' ');
  }

  /**
   * @param {Position[]} ring
   * @returns {string}
   */
  #ringToSVGPath(ring) {
    const points = [];
    for (const point of ring) {
      const reversedY = point[1];
      const x = point[0] + 180;
      const y = (reversedY * -1) + 90;
      points.push(`${x},${y}`);
    }
    return `M${points.join(' L')} Z`;
  }

  /**
   * @param {FeatureCollection<Polygon|MultiPolygon, GeoJSONFeatureProps>} geoJson
   */
  #getBoundingRectFromGeoJSON(geoJson) {
    const rect = {
      top: 0,
      bottom: 180,
      left: 360,
      right: 0,
    };

    if (geoJson.type === 'FeatureCollection') {
      for (const feature of geoJson.features) {
        if (feature.type === 'Feature') {
          if (feature.geometry.type === 'MultiPolygon') {
            const featureRect = this.#getBoundingRectFromMultiPolygon(feature.geometry);
            rect.top = Math.max(rect.top, featureRect.top);
            rect.bottom = Math.min(rect.bottom, featureRect.bottom);
            rect.left = Math.min(rect.left, featureRect.left);
            rect.right = Math.max(rect.right, featureRect.right);
          } else if (feature.geometry.type === 'Polygon') {
            const featureRect = this.#getBoundingRectFromPolygon(feature.geometry);
            rect.top = Math.max(rect.top, featureRect.top);
            rect.bottom = Math.min(rect.bottom, featureRect.bottom);
            rect.left = Math.min(rect.left, featureRect.left);
            rect.right = Math.max(rect.right, featureRect.right);
          }
        }
      }
    }

    return rect;
  }

  /**
   * @param {MultiPolygon} multiPolygon
   */
  #getBoundingRectFromMultiPolygon(multiPolygon) {
    const rect = {
      top: 0,
      bottom: 180,
      left: 360,
      right: 0,
    };

    for (const polygon of multiPolygon.coordinates) {
      for (const ring of polygon) {
        const polygonRect = this.#getBoundingRectFromRing(ring);
        rect.top = Math.max(rect.top, polygonRect.top);
        rect.bottom = Math.min(rect.bottom, polygonRect.bottom);
        rect.left = Math.min(rect.left, polygonRect.left);
        rect.right = Math.max(rect.right, polygonRect.right);
      }
    }

    return rect;
  }

  /**
   * @param {Polygon} polygon
   */
  #getBoundingRectFromPolygon(polygon) {
    const rect = {
      top: 0,
      bottom: 180,
      left: 360,
      right: 0,
    };

    for (const ring of polygon.coordinates) {
      const ringRect = this.#getBoundingRectFromRing(ring);
      rect.top = Math.max(rect.top, ringRect.top);
      rect.bottom = Math.min(rect.bottom, ringRect.bottom);
      rect.left = Math.min(rect.left, ringRect.left);
      rect.right = Math.max(rect.right, ringRect.right);
    }

    return rect;
  }

  /**
   * @param {Array<Position>} ring
   */
  #getBoundingRectFromRing(ring) {
    const rect = {
      top: 0,
      bottom: 180,
      left: 360,
      right: 0,
    };

    for (const point of ring) {
      const reversedY = point[1];
      const x = point[0] + 180;
      const y = (reversedY * -1) + 90;
      rect.top = Math.max(rect.top, y);
      rect.bottom = Math.min(rect.bottom, y);
      rect.left = Math.min(rect.left, x);
      rect.right = Math.max(rect.right, x);
    }

    return rect;
  }
}

/**
 * @template GeoJSONFeatureProps
 * @typedef {Object} GeoJsonMapOptions
 * @property {number|'inherit'} [initialWidth]
 * @property {number|'inherit'} [initialHeight]
 * @property {string|((mapFeature: MapFeature<GeoJSONFeatureProps>) => string)} [initialFill]
 * @property {Array<MapInteraction>} [interactions]
 */

/**
 * @typedef {Object} ViewBox
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */
