export const helpentries = {
  "DATEFORMAT": "Available formats:\n\nYY - Two-digit year\nYYYY - Four-digit year\n\nM - 1-12\nMM - 01-12\nMMM - Jan-Dec\nMMMM - January-December\n\nD - Day 0-31\nDD - Day 01-31",
  "LOCALES": "Set the language for number format, month and weekday labels (default: English)"
}

const help = (entry=null, {display="inline"} = {}) => {
  // Add as a block element
  if( ["block"].indexOf(display) > -1 && entry)
    return [
      { "type": "help", "display": display, "content": helpentries[entry] },
    ]
  
  // Inline float right
  if( display == "info-icon" && entry)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" style="float: right; margin-top:.5rem;" viewBox="0 0 16 16">
              <title>${helpentries[entry]}</title>
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
            </svg>`
  // If no entry was found
  return []
}

export default help;