// @ts-check

/// <reference path="../dist/geojsonmap.d.ts" />

import { GeoJsonMap, ClickAndDragMapInteraction, ScrollZoomMapInteraction } from 'geojsonmap';

main();

async function main() {
  const geoJson = await fetchGeoJSON();

  const map = new GeoJsonMap({
    initialWidth: 'inherit',
    initialHeight: 'inherit',
    initialFill: '#ffffff',
  });

  map.add(geoJson);
  map.use(new ClickAndDragMapInteraction());
  map.use(new ScrollZoomMapInteraction());

  map.on('feature:mouseenter', function (feature) {
    map.forEach(function (feature) {
      feature.fill('#306196');
    });
    feature.fill('#ffffff');
  });

  map.on('feature:mouseleave', function () {
    map.forEach(function (area) {
      area.fill('#ffffff');
    });
  });

  const div = document.createElement('div');
  div.appendChild(map.getMapElement());
  document.body.appendChild(div);
}

/**
 * @returns {Promise<import('geojson').FeatureCollection<import('geojson').MultiPolygon, GeoJsonProps>>}
 */
async function fetchGeoJSON() {
  // const response = await fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json');
  const response = await fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province.json');
  const geoJson = await response.json();
  return geoJson;
}

/**
 * @typedef {Object} GeoJsonProps
 * @property {string} ID
 * @property {string} kode
 * @property {string} Propinsi
 * @property {string} SUMBER
 */
