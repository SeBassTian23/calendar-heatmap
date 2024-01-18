/**
 * Legend Element
 */

import fontmenu, { fontfaces } from "../constants/fonts";

const legend = ( draw, { position = 'right', labels = true, suffix= '', fontFamily = fontfaces[0].value, fontSize = 18, fontWeight = "normal", fontColor = "#212529", textAlignment = "middle" } = {}) => {
  return {
    position,
    labels,
    fontFamily,
    fontSize,
    fontWeight,
    fontColor,
    textAlignment,
    suffix
  };
}

export default legend;

export const settings = () => {

  return {
    "id": "legend",
    "headerTitle": "Legend",
    "show": true,
    "disabled": false,
    "options": [
      { "type": "select", "name": "position", "value": "right", "options": ["left", "center", "right"], "label": "Position", className: 'col-6' },
      { "type": "text", "name": "suffix", "value": "", "label": "Suffix", className: 'col-6' },
      { "type": "check", "name": "labels", "value": true, "label": "Show Labels" },
      ...fontmenu({size: 18 })
    ]
  }
}