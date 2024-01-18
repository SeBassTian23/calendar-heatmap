/**
 * Label Element
 */

const labels = ( draw, { name = null, mode = 'rgb', correctLightness = false, colors = 5, nodata = '#eeeeee' } = {}) => {
  return {
    name, 
    mode, 
    correctLightness, 
    colors,
    nodata
  };
}

export default labels;

export const settings = () => {

  return {
    "id": "labels",
    "headerTitle": "labels",
    "show": true,
    "disabled": false,
    "options": [
      { "type": "select", "name": "mode", "value": "rgb", "options": ["rgb","lrgb","lab","hsl","lch"], "label": "Color Mode" },
      { "type": "check", "name": "correctLightness", "value": false, "label": "Correct Lightness" },
      { "type": "range", "name": "colors", "value": 5, "label": "Colors", "step": 1, "min": 2, "max": 10 },
      { "type": "color", "name": "nodata", "value": "#eeeeee", "label": "No Data Color" }
    ]
  }
}