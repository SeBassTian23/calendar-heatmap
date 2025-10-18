import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import isPlainObject from 'lodash/isPlainObject'
import merge from 'lodash/merge'
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
  #menu;
  #layers;
  #settings;
  #initialSettings;
  #componentSettings;
  #presets;
  #data;
  #columns;
  #draw;
  #padding;
  #startXY;
  constructor(target, {width = 'auto', height = 'auto', className, style, autoInit = true } = {}) {
    this.target = target || null;
    this.width = width == 'auto'? 1400 : width;
    this.height = height == 'auto'? 400 : height;
    this.className = className || null;
    this.style = style || null;
    this.#startXY = {x: width, y: height};
    this.#padding = {x: 20, y:20};
    this.#data = [];
    this.#columns = [];
    this.#componentSettings = cloneDeep(settings);
    this.#initialSettings = this.#settingsJSON();
    this.#settings = cloneDeep(this.#initialSettings);
    this.#menu = menu || {};
    this.#layers = layers || [];
    this.#presets = presets;
    this.#draw = null;
    autoInit? this.#buildCalendar() : null; // Call build immidiately to show an empty 
  }
  build() {
    this.#buildCalendar();
    return this.#draw.svg();
  }
  update() {
    this.#buildCalendar();
  }
  #buildCalendar() {

    // Init the SVG
    if(!this.#draw){
      
      // Initial dimensions
      if(this.target && typeof this.target === 'string'){
        this.#draw = SVG().addTo(this.target).size( this.width, this.height );
        // Add class
        if(this.className)
          this.#draw.addClass('calendar-heatmap');
        // Add css styles
        if(this.style)
          this.#draw.css(style);
      }
      else
        this.#draw = SVG().size( this.width, this.height );

      // Set viewbox
      this.#draw.viewbox(0, 0, this.width, this.height )
    }
    // Clear content before the next redraw
    this.#draw.clear()

    // Set up defs for darkmode
    if( this.settings?.darkmode?.show ){
      var defs = this.#draw.defs();

      let style = []
      for(let id in this.settings){
        if(this.settings[id]?.fontColor)
          style.push(` .${id} { fill: ${ generateDarkColor(this.settings[id].fontColor)} !important;}`)
        if(this.settings[id]?.tileFuture)
          style.push(` .future { fill: ${ generateDarkColor(this.settings[id]?.tileColor)} !important;}`)
      }

      let styleContent = '@media (prefers-color-scheme: dark) {\n';
      styleContent += style.join('\n');
      styleContent += '\n}';

      defs.element('style').words(styleContent);
    }

    // Layout collects all elements for the calendar
    var layout = {};

    var xoffset = this.#padding.x;
    var yoffset = this.#padding.y;
    var maxX = 0;

    // Apply options
    for (let i in this.#layers) {
      let key = this.#layers[i]
      if (this.settings[key] && this.settings[key].show || key == 'calendar') {
        
        // Shallow copy to prevent offsets to seep into settings
        let options = {...this.settings[key]}
        
        switch (key) {
          case 'title':
            let titleBbox = title( this.#draw, { ...options, ...{x: xoffset, y: yoffset } } ).bbox()
            yoffset += titleBbox.height;
            maxX = titleBbox.width > maxX? titleBbox.width : maxX;
            break;
          case 'subtitle':
            let subtitleBbox = subtitle( this.#draw, { ...options, ...{x: xoffset, y: yoffset } } ).bbox();
            yoffset += subtitleBbox.height;
            maxX = subtitleBbox.width > maxX? subtitleBbox.width : maxX;
            break;
          case 'scale':
            layout.scale = scale( this.#draw, { ...options } );
            break;
          case 'legend':
            layout.legend = legend( this.#draw, { ...options } );
            break;
          case 'transform':
            layout.transform = transform( this.#draw, { ...options } );
            break;
          case 'tooltip':
            layout.tooltip = tooltip( this.#draw, { ...options } );
            break;
          case 'hover':
            layout.hover = hover( this.#draw, { ...options } );
            break;         
          case 'darkmode':
            layout.darkmode = darkmode( this.#draw, { ...options } );
            break;         
          case 'calendar-month':
            layout.calendarMonthLabels = calendarMonth( this.#draw, { ...options } );
            break;
          case 'calendar-week':
            layout.calendarWeekLabels = calendarWeek( this.#draw, { ...options } );
            break;
          case 'data-input':
            layout.dataInput = dataInput( this.#draw, { ...options } );
            break;
          case 'i18n':
            layout.i18n = i18n( { ...options } );
            break;            
          case 'calendar':
            // Add gap between title and tiles if they are visible
            yoffset += (yoffset > this.#padding.y)? 20 : 0

            // Generate Calendar
            let {x, y} = calendar( this.#draw, { ...options, ...layout, ...{x: xoffset, y: yoffset }, data: this.data } );

            // Change width if Titles are wider than the calendar
            x = (x < maxX)? maxX : x

            // Add end and bottom padding
            x += this.#padding.x
            y += this.#padding.y

            // Adjust image size if set to auto
            this.#draw.size( this.#startXY.x == 'auto'? x : this.width, this.#startXY.y == 'auto'? y : this.height );
              
            // Adjust the viewbox to fit generated calendar
            this.#draw.viewbox( 0, 0, x, y );
            break;
        }
      }
    }
  }
  importData(data){

    let arr = []
    // try to parse JSON
    if( typeof(data) === 'object' && Array.isArray(data)){
      arr = data
    }
    else{
      try{
        arr = JSON.parse(data);
        if(!Array.isArray(arr))
          arr = [];
      }
      catch(e){
        data = Papa.parse(data,{
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        if(data.errors.length == 0)
          arr = data.data
        else{
          console.log(data.errors)
        }
      }
    }

    this.data = arr

    if(arr.length > 0){
      if(this.settings['data-input'] && typeof(this.data[0]) === 'object' && !Array.isArray(this.data[0])){
        this.headers = Object.keys(this.data[0]).filter( e => e !== '');
        // generate some presets
        this.settings['data-input'] = {
          dateColumn: this.headers[0],
          valueColumn: this.headers[1]
        }
        this.settings['data-input'].show = true
      }
    }
    return arr.length > 0

  }
  reset() {
    this.#columns = [];
    this.#data = [];
    this.#settings = cloneDeep(this.#initialSettings);
  }
  resetSettings() {
    this.#settings = cloneDeep(this.#initialSettings);
  }
  get settingsSave() {
    const current = this.settings;
    const initial = this.#initialSettings;
    
    return this.#getNestedChanges(current, initial);
  }
  set settings(obj) {
    this.#settings = merge(this.#settings, obj) // {...this.#settings, ...obj};
  }
  get settings() {
    return this.#settings;
  }
  settingsHTML() {

    let elCount = 0;
    let html = '<form id="settingsform">'

    for (let header in this.#menu) {

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

      for (let i in this.#menu[header]) {

        let idx = this.#componentSettings.findIndex(itm => itm.id == this.#menu[header][i]);

        if (idx == -1)
          continue;

        if (this.#componentSettings[idx].show === undefined && this.#componentSettings[idx].options === undefined)
          continue;

        html += `<div class="accordion-item">
          <h2 class="accordion-header" id="heading${idx}">
            <button class="accordion-button collapsed ps-5" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="${elCount === 0 ? 'true' : 'false'}" aria-controls="collapse${idx}">
            ${this.#componentSettings[idx].headerTitle}
            </button>
            ${this.#elementInputSwitch([this.#componentSettings[idx].id, 'show'].join('.'), {value: this.#componentSettings[idx].show, label: '', disabled: this.#componentSettings[idx].disabled || false} )}
          </h2>
          <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="heading${idx}" data-bs-parent="#${accordionid}">
            <div class="accordion-body row">`;

        if (this.#componentSettings[idx].options !== undefined && this.#componentSettings[idx].options.length > 0) {
          for (let i in this.#componentSettings[idx].options) {
            let option = this.#componentSettings[idx].options[i];
            let name = [this.#componentSettings[idx].id, option.name].join('.');
            switch(option.type){
              case('color'):
                html += this.#elementInputColor(name, { ...option })
                break
              case('text'):
                html += this.#elementInputText(name, { ...option })
                break
              case('check'):
                html += this.#elementInputCheck(name, { ...option })
                break
              case('range'):
                html += this.#elementInputRange(name, { ...option })
                break
              case('select'):
                html += this.#elementInputSelect(name, { ...option })
                break
              case('scales'):
                html += this.#elementInputScales(name, { ...option })
                break
              case('help'):
                html += this.#elementHelp({ ...option })
                break
              case('separator'):
                html += `<div class="separator"><hr></div>`
                break
            }
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
  applyPreset(id) {
    this.settings = this.presets[id]?.settings || {}
  }
  get presets(){
    return this.#presets;
  }
  set data(arr){
    this.#data = arr
  }
  get data() {
    return this.#data;
  }
  set headers(arr) {
    this.#columns = arr;
  }
  get headers() {
    return this.#columns
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
  destroy() {
    this.#draw.remove();
  }
  #getNestedChanges(obj1, obj2) {
    const changes = {};
    
    for (const key in obj2) {
      const val1 = obj1?.[key];
      const val2 = obj2[key];
      
      if (isPlainObject(val1) && isPlainObject(val2)) {
        // Recursively check nested objects
        const nestedChanges = this.#getNestedChanges(val1, val2);
        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = nestedChanges;
        }
      } else if (!isEqual(val1, val2)) {
        changes[key] = val2;
      }
    }
    
    return changes;
  }
  #settingsJSON(){
    let s = {}
    for(let i in this.#componentSettings){
      s[this.#componentSettings[i].id] = {}
      for(let a of Object.entries(this.#componentSettings[i]) ){
        if(!['id','disabled','options','headerTitle'].includes(a[0]))
          s[this.#componentSettings[i].id][a[0]] = a[1]
        if(a[0] === 'options'){
          for(let b of a[1]){
            if(b.name)
              s[this.#componentSettings[i].id][b.name] = b.value
          }
        }
      }
    }
    return s
  }
  #elementInputCheck(name = 'check', {value = true, label = 'label', className = '', disabled = false} = {}) {
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
