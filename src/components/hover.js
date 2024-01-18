/**
 * Hover Element
 * Add a hover effect to each tile
 */

const hover = ( draw, {  } = {}) => {
  draw.style("rect:hover", {strokeWidth: 2 });
  return;
}

export default hover;

export const settings = () => {

  return {
    "id": "hover",
    "headerTitle": "Hover Effect",
    "show": false,
    "disabled": false,
    "options": []
  }
}