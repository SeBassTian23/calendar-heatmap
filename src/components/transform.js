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
          {value: "log10", name: "log₁₀(x) - base 10 logarithm"}, 
          {value: "log2", name:  "log₂(x) - base 2 logarithm"},
          {value: "log", name:  "ln(x) - natural logarithm (base ℇ)"},
          {value: "sqrt", name: "√ₓ - Square Root"}, 
          {value: "x2", name: "x² - x squared"},
          {value: "1/x", name: "¹∕ₓ - 1 over x"}
        ], "label": "Transform Data" },
    ]
  }
}

export const transformValue = (value, fn = null) => {
  switch (fn) {
    case 'log10':
      value = Math.log10(value) || null;
      break;
    case 'log2':
      value = Math.log2(value) || null;
      break;
    case 'log':
      value = Math.log(value) || null;
      break;
    case 'sqrt':
      value = Math.sqrt(value) || null;
      break;
    case 'x2':
      value *= value || null; 
      break;
    case '1/x':
      value = 1/value || null;
      break;
  }
  return value;
}