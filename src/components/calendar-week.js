/**
 * Weekday Label Element
 */

import fontmenu, { fontfaces } from "../constants/fonts";

const calendarWeek = ( draw, { format = 'ddd', fontFamily = fontfaces[0].value, fontSize = 18, fontWeight = "normal", fontColor = "#212529", textAlignment = "start"  } = {}) => {
  return {
    format,
    fontFamily,
    fontSize,
    fontWeight,
    fontColor,
    textAlignment
  };
}

export default calendarWeek;

export const settings = () => {
  return {
    "id": "calendar-week",
    "headerTitle": "Week Labels",
    "show": true,
    "disabled": false,
    "options": [
      { "type": "select", "name": "format", "value": "ddd", "options": [
        {name: "Mo, Tu, We, Th …", value: "dd"},
        {name: "Mon, Tue, Wed, …", value: "ddd"},
        {name: "Monday, Tuesday, …", value: "dddd"}
      ], "label": "Week Label Format" },
      ...fontmenu({size: 18 })
    ]
  }
}
