// @ts-check

import { MapInteraction } from '../map-interaction.js';
import { assertType } from '../tools/typing.js';

/** @typedef {import('../geojsonmap.js').ViewBox} ViewBox */

export class ScrollZoomMapInteraction extends MapInteraction {
  /**
   * @param {Event} event
   * @param {ViewBox} viewBox
   * @returns {ViewBox}
   */
  viewBoxMapper(event, viewBox) {
    event.preventDefault();

    if (event instanceof WheelEvent) {
      const svg = this._svg;
      assertType(svg, SVGSVGElement);

      const scrollYDelta = event.deltaY;
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;

      const svgWidth = svg.clientWidth;
      const svgHeight = svg.clientHeight;

      const mouseXRatio = mouseX / svgWidth;
      const mouseYRatio = mouseY / svgHeight;

      const zoomFactor = scrollYDelta > 0 ? 1.1 : 0.9;

      const newWidth = viewBox.width * zoomFactor;
      const newHeight = viewBox.height * zoomFactor;

      const xDelta = (viewBox.width - newWidth) * mouseXRatio;
      const yDelta = (viewBox.height - newHeight) * mouseYRatio;

      return {
        x: viewBox.x + xDelta,
        y: viewBox.y + yDelta,
        width: newWidth,
        height: newHeight,
      };
    }

    return viewBox;
  }
}
