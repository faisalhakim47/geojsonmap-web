// @ts-check

import { MapInteraction } from '../map-interaction.js';
import { assertType } from '../tools/typing.js';

/** @typedef {import('../geojsonmap.js').ViewBox} ViewBox */

export class ClickAndDragMapInteraction extends MapInteraction {
  #isHoldClick = false;
  #pageX = 0;
  #pageY = 0;
  #originalX = 0;
  #originalY = 0;

  /**
   * @param {Event} event
   * @param {ViewBox} viewBox
   * @returns {ViewBox}
   */
  viewBoxMapper(event, viewBox) {
    event.preventDefault();

    if (event instanceof MouseEvent) {
      if (event.buttons === 1 && this.#isHoldClick === false) {
        this.#isHoldClick = true;
        this.#pageX = event.pageX;
        this.#pageY = event.pageY;
        this.#originalX = viewBox.x;
        this.#originalY = viewBox.y;
      }

      if (event.buttons === 0 && this.#isHoldClick === true) {
        this.#isHoldClick = false;
      }

      if (this.#isHoldClick === false) {
        return viewBox;
      }

      const svg = this._svg;

      assertType(svg, SVGSVGElement);

      const movementX = event.pageX - this.#pageX;
      const movementY = event.pageY - this.#pageY;

      const svgWidth = svg.clientWidth;
      const svgHeight = svg.clientHeight;

      const movementXRatio = movementX / svgWidth;
      const movementYRatio = movementY / svgHeight;

      const reversedXDelta = viewBox.width * movementXRatio;
      const reversedYDelta = viewBox.height * movementYRatio;

      const xDelta = -reversedXDelta;
      const yDelta = -reversedYDelta;

      return {
        x: this.#originalX + xDelta,
        y: this.#originalY + yDelta,
        width: viewBox.width,
        height: viewBox.height,
      };
    }

    return viewBox;
  }
}
