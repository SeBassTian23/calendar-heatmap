/**
 * Label Element
 */

import help from '../constants/help'

import LOCALES from '../constants/locales'

export const monthsForLocale = (localeName = 'en', monthFormat = 'long') => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;
  return [...Array(12).keys()]
    .map((m) => format(new Date(Date.UTC(2021, m % 12))));
}

export const weekdaysForLocale = (localeName = 'en', weekday = 'long') => {
  const { format } = new Intl.DateTimeFormat(localeName, { weekday });
  return [...Array(7).keys()]
    .map((day) => format(new Date(Date.UTC(2021, 5, day - 1))));
}

const i18n = ({ locale = 'en-US' } = {}) => {
  return {
    locale
  };
}

export default i18n;

export const settings = () => {

  const languageNamesInEnglish = new Intl.DisplayNames(navigator.languages || ['en'], { type: 'language' })

  const languages = LOCALES.filter(el => languageNamesInEnglish.of(el) != el)
    .map(el => { return { "value": el, "name": languageNamesInEnglish.of(el) } })
    .sort((a, b) => a.name.localeCompare(b.name))

  const browserLanguage = navigator.language.split("-")[0] || "en"

  return {
    "id": "i18n",
    "headerTitle": "Language",
    "show": false,
    "disabled": false,
    "options": [
      { "type": "select", "name": "locale", "value": browserLanguage, "options": languages, "label": "Localization" },
      ...help("LOCALES", { display: "block" })
    ]
  }
}