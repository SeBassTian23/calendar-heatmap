import set from 'lodash/set'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import Papa from 'papaparse'
import settings, { menu, layers } from './constants/settings'
import presets from './constants/presets'
import title from './components/title'
import subtitle from './components/subtitle'
import scale from './components/scale'
import legend from './components/legend'
import transform from './components/transform'
import tooltip from './components/tooltip'
import darkmode from './components/darkmode'
import hover from './components/hover'
import calendar from './components/calendar'
import calendarMonth from './components/calendar-month'
import calendarWeek from './components/calendar-week'
import dataInput from './components/data'
import {SVG} from '@svgdotjs/svg.js'
import i18n from './components/i18n'
import generateDarkColor from './helpers/generateDarkColor'

export default class CalendarHeatmap {
  constructor(width, height) {
    this.width = width || 1400;
    this.height = height || 400;
    this.padding = {x: 20, y: 20};
    this.menu = menu || {};
    this.layers = layers || [];
    this.settings = cloneDeep(settings) || [];
    this.settingsInitial = cloneDeep(settings);
    this.presets = presets;
    this.data = [];
  }
  build() {

    // Init the SVG
    var draw = SVG().size(this.width, this.height);

    // Set viewbox
    draw.viewbox(`0 0 ${this.width} ${this.height}`)

    var xoffset = this.padding.x;
    var yoffset = this.padding.y;

    // Set up defs for darkmode
    if( this.settings.find( itm => itm.id == 'darkmode')?.show ){
      var defs = draw.defs();

      let style = []
      for(let i in this.settings){
        if( this.settings[i].options.find( itm => itm.name == 'fontColor') ){
          style.push(` .${this.settings[i].id} { fill: ${ generateDarkColor(this.settings[i].options.find( itm => itm.name == 'fontColor')?.value)} !important;}`)
        }
        if( this.settings[i].options.find( itm => itm.name == 'tileFuture')?.value ){
          style.push(` .future { fill: ${ generateDarkColor(this.settings[i].options.find( itm => itm.name == 'tileColor')?.value)} !important;}`)
          console.log(this.settings[i].options.find( itm => itm.name == 'tileColor')?.value , generateDarkColor(this.settings[i].options.find( itm => itm.name == 'tileColor')?.value))
        }
      }

      let styleContent = '@media (prefers-color-scheme: dark) {\n';
      styleContent += style.join('\n');
      styleContent += '\n}';

      defs.element('style').words(styleContent);

    }

    var layout = {};

    // Apply options
    for (let i in this.layers) {
      let key = this.settings.findIndex(itm => itm.id == this.layers[i]);
      if (this.settings[key] && this.settings[key].show) {
        var options = this.parseOptions(this.settings[key].options)
        options.x = xoffset;
        options.y = yoffset;
        
        switch (this.settings[key].id) {
          case 'title':
            yoffset += title( draw, { ...options } ).bbox().height;
            break;
          case 'subtitle':
            yoffset += subtitle( draw, { ...options } ).bbox().height;
            break;
          case 'scale':
            layout.scale = scale( draw, { ...options } );
            break;
          case 'legend':
            layout.legend = legend( draw, { ...options } );
            break;
          case 'transform':
            layout.transform = transform( draw, { ...options } );
            break;
          case 'tooltip':
            layout.tooltip = tooltip( draw, { ...options } );
            break;
          case 'hover':
            layout.hover = hover( draw, { ...options } );
            break;         
          case 'darkmode':
            layout.darkmode = darkmode( draw, { ...options } );
            break;         
          case 'calendar-month':
            layout.calendarMonthLabels = calendarMonth( draw, { ...options } );
            break;
          case 'calendar-week':
            layout.calendarWeekLabels = calendarWeek( draw, { ...options } );
            break;
          case 'data-input':
            layout.dataInput = dataInput( draw, { ...options } );
            break;
          case 'i18n':
            layout.i18n = i18n( { ...options } );
            break;            
          case 'calendar':
            // Gap between titles and calendar
            options.y += this.padding.y
            calendar( draw, { ...options, ...layout, data: this.data } );
            break;
        }
      }
    }

    // Final SVG
    return draw.svg();
  }
  importData(data){

    let obj = []
    // try to parse JSON
    try{
      obj = JSON.parse(data);
      if(!Array.isArray(obj))
        obj = [];
    }
    catch(e){
      data = Papa.parse(data,{
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      if(data.errors.length == 0)
        obj = data.data
      else{
        console.log(data.errors)
      }
    }

    this.parseData(obj);

    return obj.length == 0

  }
  parseData(data=[]){

    this.settings.map( e => {
      if(e.id == "data-input" && data[0]){
        let keys = Object.keys(data[0]);

        keys = keys.filter( e => e !== '');

        e.options[0].options = keys;
        e.options[1].options = keys;
      }
      return e
    })

    this.data = data
  }
  parseOptions(obj) {
    if (obj === undefined)
      return {}
    let options = {}
    obj.forEach(itm => { options[itm.name] = itm.value; return options; })
    return options;
  }
  reset() {
    return this.settings = cloneDeep(this.settingsInitial);
  }
  update(obj) {
    let current = cloneDeep(this.settings);
    if (!Array.isArray(obj)) {
      for (let key in obj) {
        // Parse Value
        let value = obj[key];
        if (value == 'true')
          value = true
        if (value == 'false')
          value = false

        // Modify Key
        let modkey = key.split('.');
        let idx = current.findIndex(itm => itm.id == modkey[0]);

        modkey = modkey.slice(1);

        if (modkey[0] !== undefined && modkey[0].match(/^options\[/)) {
          modkey = modkey.slice(0, -1).join('.') + '.value';
        }
        else {
          modkey = modkey.join('.');
        }

        set(current[idx], modkey, value);
      }
    }
    this.settings = current;
  }
  settingsHTML() {

    let elCount = 0;
    let html = '<form id="settingsform">'

    for (let header in this.menu) {

      let uid = "ps-" + crypto.randomUUID();
      let accordionid = "ps-" + crypto.randomUUID();
      html += `<div style="cursor:pointer;" class="small fw-bold mt-3 mb-2 d-flex justify-content-between align-items-center" data-bs-toggle="collapse" data-bs-target="#${uid}" aria-controls="Toggle ${header}">
        ${header}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-expand me-1" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708zm0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708z"/>
        </svg>
      </div>`
      html += `<div class="collapse ${!elCount ? "show" : ""}" id="${uid}" data-bs-parent="#settingsform">`
      html += `<div class="accordion" id="${accordionid}">`

      for (let i in this.menu[header]) {

        let idx = this.settings.findIndex(itm => itm.id == this.menu[header][i]);

        if (idx == -1)
          continue;

        if (this.settings[idx].show === undefined && this.settings[idx].options === undefined)
          continue;

        html += `<div class="accordion-item">
          <h2 class="accordion-header" id="heading${idx}">
            <button class="accordion-button collapsed ps-5" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="${elCount === 0 ? 'true' : 'false'}" aria-controls="collapse${idx}">
            ${this.settings[idx].headerTitle}
            </button>
            ${this.elementInputSwitch([this.settings[idx].id, 'show'].join('.'), {value: this.settings[idx].show, label: '', disabled: this.settings[idx].disabled || false} )}
          </h2>
          <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#${accordionid}">
            <div class="accordion-body row">`;

        if (this.settings[idx].options !== undefined && this.settings[idx].options.length > 0) {
          for (let i in this.settings[idx].options) {
            let option = this.settings[idx].options[i];
            let name = [this.settings[idx].id, `options[${i}]`, option.name].join('.');
            if (option.type == 'color')
              html += this.elementInputColor(name, { ...option })
            if (option.type == 'text')
              html += this.elementInputText(name, { ...option })
            if (option.type == 'check')
              html += this.elementInputCheck(name, { ...option })
            if (option.type == 'range')
              html += this.elementInputRange(name, { ...option })
            if (option.type == 'select')
              html += this.elementInputSelect(name, { ...option })
            if (option.type == 'scales')
              html += this.elementInputScales(name, { ...option })
            if (option.type == 'help')
              html += this.elementHelp({ ...option })
            if (option.type == 'separator')
              html += `<div class="separator"><hr></div>`
          }
        }
        else {
          html += `<div class="form-text">No settings available</div>`
        }

        html += `</div>
          </div>
        </div>`
        elCount++;
      }
      html += `</div>`

      html += `</div>`
    }
    html += '</form>'

    return html;
  }
  getPreset(id) {
    let preset = get(this.presets, id, {});
    return preset.settings || {}
  }
  presetsHTML() {
    let html = `<select class="form-select form-select-sm" aria-label="Default select example" id="presets-selector">`;
    html += `<option value="-1" disabled selected>Select&hellip;</option>`;
    if(Array.isArray(this.presets)){
      for (let i in this.presets)
      html += `<option value="${i}">${this.presets[i].title}</option>`;
    }
    else if (typeof this.presets == 'object' ){
      for (let group in this.presets) {
        html += `<optgroup label="${group}">`
        for (let i in this.presets[group])
          html += `<option value="${group}[${i}]">${this.presets[group][i].title}</option>`;
        html += `</optgroup>`
      }
    }
    html += `</select>`;
    return html;
  }
  elementInputCheck(name = 'check', {value = true, label = 'label', className = '', disabled = false} = {}) {
    let id = "ch-" + crypto.randomUUID();
    return `<div class="form-check mb-1">
      <input class="form-check-input" name="${name}" type="checkbox" value="${true}" id="${id}" ${value ? 'checked' : ''}>
      <label class="form-check-label" for="${id}">${label}</label>
    </div>`;
  }
  #elementInputSwitch(name = 'switch', {value = true, label = 'label', className = '', disabled = false} = {}) {
    let id = "ch-" + crypto.randomUUID();
    return `<div class="form-check form-switch fs-6" style="position:relative; margin:-2.1rem .5rem .6rem .5rem; z-index:10; width:2em;">
    <input class="form-check-input" type="checkbox" role="switch" name="${name}" value="${true}" id="${id}" ${value ? 'checked' : ''} ${disabled ? 'disabled' : ''} switch>
    <label class="form-check-label" for="${id}">${label}</label>
  </div>`

  }
  #elementInputText(name = 'text', {value = 'Text', label = 'label', icon='', className = '', disabled = false} = {}) {
    let id = "ch-" + crypto.randomUUID();
    return `<div class="mb-1 ${className}">
      <label for="${id}" class="form-label">${label}</label>${icon}
      <input type="text" class="form-control form-control-sm" name="${name}" id="${id}" placeholder="${value}" value="${value}">
    </div>`;
  }
  #elementInputColor(name = 'color', {value = '#000000', label = 'label', className = '', disabled = false} = {} ) {
    let id = "ch-" + crypto.randomUUID();
    return `<div class="d-flex mb-1 ${className}">
      <input type="color" class="form-control form-control-color" name="${name}" id="${id}" value="${value}" title="Choose ${label} color">
      <label for="${id}" class="col-sm-9 col-form-label">${label}</label>
    </div>`;
  }
  #elementInputRange(name = 'range', {value = -1, label = 'label', icon='', step = 1, min = 0, max = 1, className = '', disabled = false} = {}) {
    let id = "ch-" + crypto.randomUUID();
    return `<div class="mt-1">
    <label for="${id}" class="form-label" style="margin-bottom:-1.5rem">
      ${label} (${min}-${max}, default: ${value})
    </label>${icon}
    <input type="range" class="form-range" name="${name}" id="${id}" value="${value}" min="${min}" max="${max}" step="${step}">      
    </div>`;
  }
  #elementInputSelect(name = 'select', {value = '', label = 'label', icon = '', options = [], className = '', disabled = false} = {}) {
    let id = "ch-" + crypto.randomUUID();
    options = options.map( e => e.name? `<option value="${e.value}"${ e.value == value? "selected" : ""}>${e.name}</option>`: `<option value="${e}"${ e == value? "selected" : ""}>${e}</option>` )
    return `<div class="mb-2 ${className}">
      <label for="${id}" class="form-label">${label}</label>${icon}
      <select class="form-select form-select-sm" name="${name}" id="${id}">${options.join('\n')}</select>
    </div>`;
  }
  #elementInputRadio(name = 'check', {value = '', label = 'label', className = '', disabled = false} = {}) {
    let id = "ch-" + crypto.randomUUID();
    return `<div class="form-check mb-1">
      <input class="form-check-input" name="${name}" type="radio" autocomplete="off" value="${true}" id="${id}" ${value ? 'checked' : ''}>
      <label class="form-check-label" for="${id}">${label}</label>
    </div>`;
  }
  #elementInputScales(name = 'scales', {value = '', label = 'label', options = [], className = '', disabled = false} = {}) {
    options = options.map( e => {
      let id = "ch-" + crypto.randomUUID();
      return `<div>
        <input class="form-radio-scale d-none" type="radio" name="${name}" value="${e.name}" autocomplete="off" id="${id}" ${e.name == value? 'checked' : ''}>
        <label class="form-check-label border" for="${id}" title="${e.name}" style="background: linear-gradient( to bottom, ${e.value.map( (e,i) => `${e} ${20 * i}%, ${e} ${20 * (i+1)}%`).join(',')}); width:15px; height:75px;"></label>
        </div>`
      });
    return `<div class="mb-1 ${className}">
        <label class="form-check-label mb-1">${label}</label>
        <div class="p-1" style="display:flex; flex-wrap: wrap; column-gap: 5px;">
          ${options.join('\n')}
        </div>
      </div>`;
  }
  #elementHelp(options) {
    let id = "ch-" + crypto.randomUUID();
    if (options.display == 'inline')
      return `<span>${options.content}</span>`
    if (options.display == 'block')
      return `<div id="${id}" class="form-text">
        ${options.content}
      </div>`
  }
}
