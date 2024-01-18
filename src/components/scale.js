/**
 * Scale Element
 */

import chroma from 'chroma-js'

const scale = ( draw, { name = null, reverse = false, mode = 'rgb', correctLightness = false, gamma = 1, colors = 5, nodata = '#eeeeee' } = {}) => {
  
  let colorScale = chroma.scale(name)

  if(correctLightness){
    colorScale.correctLightness()
  }

  if(nodata){
    colorScale.nodata(nodata)
  }

  colorScale.gamma(gamma)
  
  colorScale.mode(mode)
    
  let hexcolors = colorScale.colors(colors)

  if(reverse)
    hexcolors.reverse();
  
  return {
    hexcolors,
    nodata
  };
}

export default scale;

export const settings = () => {

  let scales = Object.keys(chroma.brewer)
                .filter( s => s.charAt(0) == s.charAt(0).toUpperCase() )
                .sort((a,b) => a.toLowerCase() < b.toLowerCase()? -1 : 1 );

  let scalesColors = scales.map( e => {
    return {"value": chroma.scale(e).colors(5), "name": e}
  });

  return {
    "id": "scale",
    "headerTitle": "Scale",
    "show": true,
    "disabled": false,
    "options": [
      { "type": "scales", "name": "name", "value": scales[scales.length-1], "options": scalesColors, "label": "Color Scale" },
      { "type": "check", "name": "reverse", "value": false, "label": "Reverse Scale" },
      { "type": "range", "name": "colors", "value": 5, "label": "Color Steps", "step": 1, "min": 3, "max": 12 },
      { "type": "select", "name": "mode", "value": "rgb", "options": ["rgb","lrgb","lab","hsl","lch"], "label": "Color Mode" },
      { "type": "check", "name": "correctLightness", "value": false, "label": "Correct Lightness" },
      { "type": "range", "name": "gamma", "value": 1, "label": "Gamma", "step": 0.1, "min": 0.1, "max": 2 },
      { "type": "color", "name": "nodata", "value": "#eeeeee", "label": "No Data Color" }
    ]
  }
}