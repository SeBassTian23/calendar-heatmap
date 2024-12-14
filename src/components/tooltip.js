/**
 * Tooltip Element
 */

import help from "../constants/help";

const hover = ( draw, { format = 'YYYY-MM-DD', data = false } = {}) => {
  return {
    format,
    data
  };
}

export default hover;

export const settings = () => {

  return {
    "id": "tooltip",
    "headerTitle": "Tooltips",
    "show": false,
    "disabled": false,
    "options": [
      { "type": "text", "name": "format", "value": "YYYY-MM-DD", "label": "Date Format", "icon": help("DATEFORMAT", {display: "info-icon"}) },
      { "type": "check", "name": "data", "value": true, "label": "Include Datapoint" },
    ]
  }
}