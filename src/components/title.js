/**
 * Main Title Element
 */

import fontmenu, { fontfaces } from "../constants/fonts";

const title = ( draw, { titleText = 'Main Title', fontFamily = fontfaces[0].value, fontSize = 36, fontWeight = 'normal', fontColor = '#212529', textAlignment = "start", x = 0, y = 0 } = {}) => {

  titleText = titleText.replace(' ', ' ')

  var text = draw.plain(titleText);
  
  if(textAlignment == 'middle')
    x = draw.width() / 2

  if(textAlignment == 'end')
    x = draw.width() - x

  text.font({
    family: fontFamily, 
    size: fontSize,
    weight: fontWeight,
    anchor: textAlignment,
    fill: fontColor
  });

  text.move(x,y)

  text.addClass('title')

  return text;
}

export default title;

export const settings = () => {
  return {
    "id": "title",
    "headerTitle": "Title",
    "show": true,
    "disabled": false,
    "options": [
      { "type": "text", "name": "titleText", "value": "Main Title", "label": "Text" },
      ...fontmenu({size: 36 })
    ]
  }
}