/**
 * Data Element
 */

const dataInput = ( draw, { dateColumn = '', valueColumn = '', monthStart = null, monthEnd = null } = {}) => {
  return {
    dateColumn,
    valueColumn,
    monthStart,
    monthEnd
  };
}

export default dataInput;

export const settings = () => {
  return {
    "id": "data-input",
    "headerTitle": "Imported Data",
    "show": false,
    "disabled": false,
    "options": [
      { "type": "select", "name": "dateColumn", "value": '', options: [], "label": "Dates" },
      { "type": "select", "name": "valueColumn", "value": '', options: [], "label": "Values" },
      { "type": "month", "name": "monthStart", "value": false, "label": "Start Month and Year" },
      { "type": "month", "name": "monthEnd", "value": false, "label": "End Month and Year" },
    ]
  }
}