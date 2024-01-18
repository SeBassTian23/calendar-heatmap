/**
 * Sub-Title Element
 */

import fontmenu, { fontfaces } from "../constants/fonts";

const subtitle = ( draw, { titleText = 'Sub Title', fontFamily = fontfaces[0].value, fontSize = 24, fontWeight = 'normal', fontColor = '#212529', textAlignment = "start", x = 0, y = 0 } = {}) => {

  titleText = titleText.replace(' ', ' ')

  var text = draw.text(titleText);
  
  if(textAlignment == 'middle')
    x = draw.width() / 2

  if(textAlignment == 'end')
    x = draw.width() - x

  text.move(x,y);

  text.font({
    family: fontFamily, 
    size: fontSize,
    weight: fontWeight,
    anchor: textAlignment,
    fill: fontColor,
    opacity: .75
  });

  return text;
}

export default subtitle;

export const settings = () => {
  return {
    "id": "subtitle",
    "headerTitle": "Subtitle",
    "show": true,
    "disabled": false,
    "options": [
      { "type": "text", "name": "titleText", "value": "Sub Title", "label": "Text" },
      ...fontmenu({size: 24, fontColor: "#65696c" })
    ]
  }
}