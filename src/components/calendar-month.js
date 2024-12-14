/**
 * Month Label Element
 */

import fontmenu, { fontfaces } from "../constants/fonts";
import help from "../constants/help";

const calendarMonth = ( draw, { format = 'MMM \'YY', fontFamily = fontfaces[0].value, fontSize = 18, fontWeight = "normal", fontColor = "#212529", textAlignment = "middle"  } = {}) => {
  return {
    format,
    fontFamily,
    fontSize,
    fontWeight,
    fontColor,
    textAlignment
  };
}

export default calendarMonth;

export const settings = () => {
  return {
    "id": "calendar-month",
    "headerTitle": "Month Labels",
    "show": true,
    "disabled": false,
    "options": [
      { "type": "text", "name": "format", "value": "MMM \'YY", "label": "Month Label Format", "icon": help("DATEFORMAT", {display: "info-icon"}) },
      ...fontmenu({size: 18, textAlignment: "middle" })
    ]
  }
}
