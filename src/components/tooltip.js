/**
 * Tooltip Element
 */

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
      { "type": "text", "name": "format", "value": "YYYY-MM-DD", "label": "Date Format" },
      { "type": "check", "name": "data", "value": true, "label": "Add Datapoint" },
    ]
  }
}