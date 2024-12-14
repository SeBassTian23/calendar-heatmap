import * as title from '../components/title'
import * as subtitle from '../components/subtitle'
import * as scale from  '../components/scale'
import * as legend from  '../components/legend'
import * as labels from  '../components/labels'
import * as hover from  '../components/hover'
import * as transform from  '../components/transform'
import * as tooltip from  '../components/tooltip'
import * as calendar from  '../components/calendar'
import * as calendarMonth from  '../components/calendar-month'
import * as calendarWeek from  '../components/calendar-week'
import * as dataInput from  '../components/data'
import * as i18n from  '../components/i18n'

const settings = [
  title.settings(),
  subtitle.settings(),
  scale.settings(),
  legend.settings(),
  labels.settings(),
  hover.settings(),
  transform.settings(),
  tooltip.settings(),
  calendar.settings(),
  calendarMonth.settings(),
  calendarWeek.settings(),
  dataInput.settings(),
  i18n.settings(),
]

export default settings;

export const layers = [
  "title",
  "subtitle",
  "scale",
  "legend",
  "i18n",
  "hover",
  "tooltip",
  "data-input",
  "data",
  "transform",
  "calendar-month",
  "calendar-week",
  "calendar",
];

export const menu = {
  "Layout": [
    "calendar",
    "title",
    "subtitle",
    "calendar-month",
    "calendar-week",
    "legend",
    "i18n"
  ],
  "Data": [
    "data-input",
    "scale",
    "transform",
  ],
  "Interactivity": [
    "hover",
    "tooltip",
  ]
};