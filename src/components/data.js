/**
 * Data Element
 */

const dataInput = ( draw, { dateColumn = '', valueColumn = '' } = {}) => {
  return {
    dateColumn,
    valueColumn
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
    ]
  }
}