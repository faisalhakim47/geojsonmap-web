// @ts-check

import { MapInteraction } from '../map-interaction.js';
import { assertType } from '../tools/typing.js';

/** @typedef {import('../geojsonmap.js').ViewBox} ViewBox */

export class ClickAndDragMapInteraction extends MapInteraction {
  /**
   * @param {Event} event
   * @param {ViewBox} viewBox
   * @returns {ViewBox}
   */
  viewBoxMapper(event, viewBox) {
    event.preventDefault();

    if (event instanceof MouseEvent) {
      const svg = this._svg;
      assertType(svg, SVGSVGElement);

      const isHoldClick = event.buttons === 1;

      if (!isHoldClick) {
        return viewBox;
      }

      const movementX = -event.movementX;
      const movementY = -event.movementY;

      const svgWidth = svg.clientWidth;
      const svgHeight = svg.clientHeight;

      const movementXRatio = movementX / svgWidth;
      const movementYRatio = movementY / svgHeight;

      const xDelta = viewBox.width * movementXRatio;
      const yDelta = viewBox.height * movementYRatio;

      return {
        x: viewBox.x + xDelta,
        y: viewBox.y + yDelta,
        width: viewBox.width,
        height: viewBox.height,
      };
    }

    return viewBox;
  }
}
