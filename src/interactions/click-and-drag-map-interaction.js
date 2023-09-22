import { MapInteraction } from '../map-interaction.js';

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
      const isHoldClick = event.buttons === 1;

      if (!isHoldClick) {
        return viewBox;
      }

      const movementX = -event.movementX;
      const movementY = -event.movementY;

      const svgWidth = this._svg.clientWidth;
      const svgHeight = this._svg.clientHeight;

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
