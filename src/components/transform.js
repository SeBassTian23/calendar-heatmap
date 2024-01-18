/**
 * Transform Element
 */

const transform = ( draw, { fn = 'log10' } = {}) => {
  return {
    fn
  };
}

export default transform;

export const settings = () => {

  return {
    "id": "transform",
    "headerTitle": "Transform",
    "show": false,
    "disabled": false,
    "options": [
      { "type": "select", "name": "fn", "value": "log₁₀", "options": [
          {value: "log10", name: "log₁₀"}, 
          {value: "ln2", name:  "ln₂"},
          {value: "sqrt", name: "SQRT √"}, 
          {value: "x2", name: "x²"}
        ], "label": "Transform Data" },
    ]
  }
}

export const transformValue = (value, fn = null) => {
  switch (fn) {
    case 'log10':
      value = Math.log10(value) || null;
      break;
    case 'ln2':
      value = Math.log2(value) || null;
      break;
    case 'sqrt':
      value = Math.sqrt(value) || null;
      break;
    case 'x2':
      value *= value || null; 
      break;
  }
  return value;
}