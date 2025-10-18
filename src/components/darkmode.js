/**
 * Darkmode
 * Automatically change text fill for darkmode
 */

const darkmode = ( draw, {  } = {}) => {
  draw.style("rect:hover", {strokeWidth: 2 });
  return;
}

export default darkmode;

export const settings = () => {

  return {
    "id": "darkmode",
    "headerTitle": "Darkmode",
    "show": true,
    "disabled": false,
    "options": []
  }
}