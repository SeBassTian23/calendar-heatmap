export const fontfaces = [
  {name: "System", value: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Liberation Sans, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji"},
  {name: "Arial", value: "Arial"},
  {name: "Times New Roman", value: "Times New Roman"},
  {name: "Calibri", value: "Calibri"},
  {name: "Courier New", value: "Courier New"},
  {name: "Verdana", value: "Verdana"}
]

const fontmenu = ({size=18, fontFamily = fontfaces[0].value, fontWeight = 'normal', textAlignment="left", fontColor="#212529"} = {}) => {
  return [
    { "type": "select", "name": "fontFamily", "value": fontFamily, "options": fontfaces, "label": "Font", className: "col-6" },
    { "type": "select", "name": "fontSize", "value": size, "options": [8,9,10,11,12,14,18,24,30,36,48,60,72,96], "label": "Size", className: "col-6" },
    { "type": "select", "name": "fontWeight", "value": fontWeight, "options": [
      {name: "light", value:"lighter"},
      "normal",
      "bold"
    ], "label": "Style", className: "col-6" },
    { "type": "select", "name": "textAlignment", "value": textAlignment, "options": [
        {name: "left", value: "start"},
        {name: "center", value: "middle"},
        {name: "right", value: "end"},
      ], "label": "Align", className: "col-6" },
    { "type": "color", "name": "fontColor", "value": fontColor, "label": "Color" }
  ]
}

export default fontmenu;
