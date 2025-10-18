/**
 * Calendar Element
 */

import chroma from 'chroma-js'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import updateLocale from 'dayjs/plugin/updateLocale'
import isoWeek from 'dayjs/plugin/isoWeek'
import isToday from 'dayjs/plugin/isToday'
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.extend(isoWeek);
dayjs.extend(isToday);
dayjs.extend(minMax);

import {transformValue} from '../components/transform'
import {monthsForLocale, weekdaysForLocale} from '../components/i18n'
import help from "../constants/help";

const calendar = ( draw, {x=0, y=0, data = [], weekStart = 1, tileSize = 16, tileColor = "#dddddd", tileFuture = true, tileShape= "rectangle", tilePadding = 4.5, monthPadding = 10, monthGap = true, monthsWrapAfter = 12, monthsRowsReverse=false, calendarMonthLabels = false, calendarWeekLabels = false,  scale = false, legend = false, transform = false, tooltip = false, dataInput = false, i18n = false } = {}) => {

  // Initial variables
  let initial_x = x;
  let offset_x = x;
  let offset_y = y;
  let offset_x_max = x;
  let end_y = offset_y;
  let max_x = 0
  let tileBorder = chroma(tileColor).darken(2).hex();
  let monthLabelHeight = 0

  // Parse size as Number
  tileSize = Number(tileSize)
  tilePadding = Number(tilePadding)
  monthPadding = Number(monthPadding)
  weekStart = Number(weekStart)

  // Calendar
  let startDate = dayjs().subtract(8, 'month').startOf('month');
  let months = 12;

  let minMonth = dayjs.min( ...data.map( e => dayjs(e.date || e[dataInput.dateColumn]) )) || null
  let maxMonth = dayjs.max( ...data.map( e => dayjs(e.date || e[dataInput.dateColumn]) )) || null

  let minData = Math.min( ...data.filter(e=> (e.value || e[dataInput.valueColumn]) !== null && !isNaN( e.value || e[dataInput.valueColumn] )).map( e => e.value || e[dataInput.valueColumn]) )
  let maxData = Math.max( ...data.filter(e=> (e.value || e[dataInput.valueColumn]) !== null && !isNaN( e.value || e[dataInput.valueColumn] )).map( e => e.value || e[dataInput.valueColumn]) )

  // Format the date column to make the rendering later on faster
  let dataFormatted = data.map( e => {
    if (e.date !==undefined)
      e.date = dayjs(e.date).format('YYYY-MM-DD');
    else
      e[dataInput.dateColumn] = dayjs(e[dataInput.dateColumn]).format('YYYY-MM-DD');
    return e;
  });

  if(minMonth && dataInput){
    startDate = minMonth.startOf('month');
    months = Math.ceil(maxMonth.diff(minMonth, 'month', true));
  }

  // Locale based formates
  dayjs.updateLocale("en", {
    months: function (dayjsInstance, format) {
      if (i18n)
        return monthsForLocale(i18n.locale, 'long')[dayjsInstance.month()]
      else
        return monthsForLocale('en', 'long')[dayjsInstance.month()]
    },
    monthsShort: function (dayjsInstance, format) {
      if (i18n)
        return monthsForLocale(i18n.locale, 'short')[dayjsInstance.month()]
      else
        return monthsForLocale('en', 'short')[dayjsInstance.month()]
    },
    weekdays: weekdaysForLocale(i18n.locale || 'en', 'long'),
    weekdaysShort: weekdaysForLocale(i18n.locale || 'en', 'long').map(el => el.substring(0,3)),
    weekdaysMin: weekdaysForLocale(i18n.locale || 'en', 'short'),
  });

  // Color Scale
  let colors = [] 
  if(scale){
    colors = scale.hexcolors;
  }
  
  // Weekday Labels
  let weekdays = [...Array(7).keys()];
  let weeklabelWidth = 0;
  if(calendarWeekLabels){
    if(calendarWeekLabels.format == 'dd') weekdays = dayjs.weekdaysMin();
    if(calendarWeekLabels.format == 'ddd') weekdays = dayjs.weekdaysShort();
    if(calendarWeekLabels.format == 'dddd') weekdays = dayjs.weekdays();

    // Calculate weeklabelWidth as offset
    [0,2,4,6].forEach( wd => {
      let text = draw.text(weekdays[(wd+weekStart) % weekdays.length]);
      text.font({
        family: calendarWeekLabels.fontFamily, 
        size: calendarWeekLabels.fontSize,
        weight: calendarWeekLabels.fontWeight,
      });
      if(weeklabelWidth < text.bbox().w)
        weeklabelWidth = text.bbox().w + 5 + tilePadding;
      text.remove();
    });

    offset_x += weeklabelWidth;
  }

  let groupROW = null;

  // Build calendar months
  for(let t=0; t<months; t++){
    
    if(!groupROW)
      groupROW = draw.group().addClass('row');

    let wrap = false;
    if (t > 0 && t%monthsWrapAfter == 0){
      offset_x = initial_x + weeklabelWidth;
      y = offset_y += (tileSize * 7) + (tilePadding * 6) + tileSize * 2;
      if(calendarMonthLabels && calendarMonthLabels.format !== ""){
        offset_y += monthLabelHeight
      }
      wrap = true
      groupROW = draw.group().addClass('row');
    }

    let group = draw.group();

    let month_days = startDate.daysInMonth();
    let day_count = 1;

    // Build calendar weeks
    for(let m=0; m<6; m++ ){

      // Build calendar days
      let wStart = false;
      let wStartIdx = (weekStart % weekdays.length);

      for(let w=0; w<7; w++){

        // Done with current month, no more weeks needed
        if(month_days < day_count)
          continue;

        // Calculate x,y positions
        x = (offset_x + ((tilePadding + tileSize) * m))
        y = (offset_y + ((tilePadding + tileSize) * w))

        // Add Weekday Labels before the first month
        if((t == 0 || wrap) && m == 0 && calendarWeekLabels){
          // Add Labels at positions 0, 2, 4, 6
          if([0,2,4,6].indexOf(w) > -1){
            let text = draw.text(weekdays[(w+weekStart) % weekdays.length]);
            text.font({
              family: calendarWeekLabels.fontFamily, 
              size: calendarWeekLabels.fontSize,
              weight: calendarWeekLabels.fontWeight,
              anchor: calendarWeekLabels.textAlignment,
              fill: calendarWeekLabels.fontColor
            });
            text.addClass('calendar-week');
            text.move(offset_x - (weeklabelWidth - tilePadding) , y -2 );
            group.add(text);
          }
        }

        if(x> max_x)
          max_x = x;

        // Continue if the weekday is not matching
        if(m == 0 && !wStart){
          if( weekdays[wStartIdx % weekdays.length] == weekdays[startDate.isoWeekday() % weekdays.length] ){
            wStart = true;
          }
          else{
            wStartIdx++
            continue
          }
        }

        // Add a day
        let currentTileColor = tileColor;
        let dayData = null
        let value = null;

        if(scale && data.length > 0){
          let startDateFormatted = startDate.format('YYYY-MM-DD')
          dayData = dataFormatted.find( e => e[dataInput.dateColumn] == startDateFormatted ) || null;
          if(dayData){

            value = (dayData.value || dayData[dataInput.valueColumn]);
            
            let bins = createBins(minData, maxData, colors.length);
            let binIndex = getBinIndex(bins, value );

            // Transform data
            if (transform){
              bins = createBins(transformValue(minData, transform.fn), transformValue(maxData, transform.fn), colors.length);
              binIndex = getBinIndex(bins, transformValue(value, transform.fn) );
            }

            if(binIndex > -1 && value !== null )
              currentTileColor = colors[binIndex];
            else
              currentTileColor = scale.nodata
          }
        }

        // Draw tile
        let tile = drawTile( draw, x, y, tileShape, tileSize, currentTileColor, tileBorder )

        // Add title element as Tooltips
        if(tooltip && tile){
          let tip = startDate.format( tooltip.format );
          if(tooltip.data){
            tip = dayData? `${value !== null? `${Intl.NumberFormat(i18n.locale || "en", { maximumSignificantDigits: 4 }).format(value)}${legend? legend.suffix : ''}` : 'NaN' } on ${tip}` : tip
          }
          tile.add( draw.element('title').words( tip ) );
        }

        // Set up for future days
        if (startDate.isToday() && tileFuture){
          tileColor = chroma(tileColor).brighten(0.5);
        }

        // Add classes for Darkmode
        if(currentTileColor == scale.nodata)
          tile.addClass('no-data')

        if( startDate.isAfter(dayjs()) )
          tile.addClass('future')

        if( end_y < y)
          end_y = y;

        if(month_days == day_count && w == 6){
          x += tileSize + tilePadding
        }

        // Add tiles to group
        group.add(tile);

        // Add next day
        startDate = startDate.add(1, 'day');
        day_count++
      }
    }

    // Add the label
    if(calendarMonthLabels && calendarMonthLabels.format !== ""){
      let text = draw.plain(startDate.subtract(1, 'day').format(calendarMonthLabels.format));

      text.font({
        family: calendarMonthLabels.fontFamily, 
        size: calendarMonthLabels.fontSize,
        weight: calendarMonthLabels.fontWeight,
        anchor: calendarMonthLabels.textAlignment,
        fill: calendarMonthLabels.fontColor
      });
      text.addClass('calendar-month');

      if(calendarMonthLabels.textAlignment == 'middle') {
        text.amove( offset_x + ( tileSize + x - offset_x )/2, (end_y + tilePadding + tileSize) + text.bbox().h );
      }
      else if(calendarMonthLabels.textAlignment == 'end') {
        text.amove( (x + tileSize), (end_y + tilePadding + tileSize) + text.bbox().h );
      }
      else {
        text.amove(offset_x, (end_y + tilePadding + tileSize) + text.bbox().h );
      }

      monthLabelHeight = text.bbox().h

      // Add month label
      group.add(text);
      groupROW.add(group);
    }

    // calculate offset for next month
    offset_x = x;
    if(monthGap)
      offset_x += monthPadding + tileSize;

    if(offset_x_max < offset_x)
      offset_x_max = offset_x;
  }

  // Reverse the order of rows
  if (monthsRowsReverse) {
    let groups = draw.find(".row");
  
    // Create array of groups with their positions
    let groupsWithPos = []
    groups.each(group => {
      let bbox = group.bbox();
      groupsWithPos.push({ 'x': bbox.x, 'y': bbox.y})
    });
  
    // Sort by position in reverse order and move groups to new positions
    groupsWithPos.reverse().forEach((item, index) => {
      groups[index].move(item.x, item.y)
    });
  }

  // calculate offset
  offset_y += (tileSize * 7) + (tilePadding * 6) + tileSize * 1.5

  // add offset only if there is a string
  if(calendarMonthLabels && calendarMonthLabels.format !== ""){
    offset_y += monthLabelHeight
  }

  // Legend
  if(legend){
    offset_y = drawLegend( draw, offset_x_max, offset_y, colors, minData, maxData, tileShape, tileBorder, tileSize, tilePadding, monthGap, monthPadding, legend, transform, tooltip, i18n );
  }

  return {x: (max_x + tileSize), y: offset_y };
}

export default calendar;

export const settings = () => {
  return {
    "id": "calendar",
    "headerTitle": "Calendar",
    "show": true,
    "disabled": true,
    "options": [
      { "type": "range", "name": "tileSize", "value": 16, "label": "Tile Size", "step": 0.5, "min": 2, "max": 30 },
      { "type": "select", "name": "tileShape", "value": 'rectangle', options: ["rectangle", "rectangle (rounded)", "circle"], "label": "Tile Shape"},
      { "type": "color", "name": "tileColor", "value": "#dddddd", "label": "Tile Color" },
      { "type": "check", "name": "tileFuture", "value": true, "label": "Future Days (lighten color)" },
      { "type": "separator" },
      { "type": "range", "name": "tilePadding", "value": 4.5, "label": "Tile Padding", "step": 0.5, "min": 0, "max": 10 },
      { "type": "range", "name": "monthPadding", "value": 10, "label": "Month Padding", "step": 1, "min": 0, "max": 50 },
      { "type": "check", "name": "monthGap", "value": true, "label": "Gap between Months" },
      { "type": "separator" },
      { "type": "select", "name": "weekStart", "value": 0, options: [
          {value: 1, name: 'Monday'},
          {value: 2, name: 'Tuesday'},
          {value: 3, name: 'Wednesday'},
          {value: 4, name: 'Thursday'},
          {value: 5, name: 'Friday'},
          {value: 6, name: 'Saturday'},
          {value: 0, name: 'Sunday'},
        ], "label": "Week Start"},
      { "type": "separator" },
      { "type": "range", "name": "monthsWrapAfter", "value": 12, "label": "Months Wrap", icon: help("MONTHWRAP", {display: "info-icon"}), "step": 1, "min": 1, "max": 24 },
      { "type": "check", "name": "monthsRowsReverse", "value": false, "label": "Reverse Row Order" },
    ]
  }
}

// Create bins
function createBins(min, max, numBins) {

  const step = (max - min) / numBins;

  const bins = [];

  for (let i = 0; i < numBins; i++) {
    bins.push([i * step + min, i == numBins-1?  max : (i + 1) * step + min]);
  }

  return bins;
}

// Lookup bin index for value
function getBinIndex(bins, value) {
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i];
    if (value >= bin[0] && value <= bin[1]) {
      return i;
    }
  }

  return -1; // no bin found
}

// Draw a tile representing a day
const drawTile = ( draw, x, y, shape, size, color, border ) => {

  let tile = null;

  if(shape == 'circle')
    tile = draw.circle(size)
            .fill({ color, opacity: 1 }).move( x, y )
            .stroke({ color: border, opacity: 0.75, width: 1 })
  else
    tile = draw.rect(size, size)
            .fill({ color, opacity: 1 }).move( x, y )
            .stroke({ color: border, opacity: 0.75, width: 1 })

  if(shape == 'rectangle (rounded)')
    tile.radius(size * .2)

  return tile;
}

// Draw the legend
const drawLegend = ( draw, x, y, colors, min, max, tileShape, tileBorder, tileSize, tilePadding, gap, gapPadding, legend, transform, tooltip, i18n ) => {

  // Legend
  let legendMin = Number.isFinite(min)? min : 'Min'
  let legendMax = Number.isFinite(max)? max : 'Max'
  let x_init = x
  let labelOffset = 0;

  let group = draw.group();

  if(legend.position == 'left')
    x_init = 20;
  
  if(legend.position == 'right'){
    x_init = x - (colors.length * (tilePadding + tileSize));
    if(gap)
      x_init -= gapPadding;
  }

  if(legend.position == 'center')
    x_init = (x/2) - ( (colors.length * (tilePadding + tileSize)) / 2 ) ;

  if (transform){
    legendMin = transformValue(min, transform.fn) || 'Min'
    legendMax = transformValue(max, transform.fn) || 'Max'
  }

  const NumberFormat = new Intl.NumberFormat(i18n.locale || "en", { maximumSignificantDigits: 4 })

  if(legendMin != 'Min') legendMin = NumberFormat.format(legendMin)
  if(legendMax != 'Max') legendMax = NumberFormat.format(legendMax)

  if(legend.suffix != ''){
    if(legendMin != 'Min') legendMin += legend.suffix;
    if(legendMax != 'Max') legendMax += legend.suffix;
  }

  // Legend padding
  var y_pad = 0;

  if(legend.position != 'center'){
    var text_tmp = draw.plain( legend.position == 'right'? legendMax : legendMin );
    text_tmp.font({
      family: legend.fontFamily,
      size: legend.fontSize,
      weight: legend.fontWeight,
    });
    y_pad = text_tmp.bbox().w / 2;
    text_tmp.remove();

    if(legend.position == 'right')
      y_pad = (y_pad + 10) * -1
  }

  for(let s = 0; s < colors.length; s++){    

    // Add tile
    let tile = drawTile( draw, (x_init + y_pad + ((tilePadding + tileSize) * s)), y, tileShape, tileSize, colors[s], tileBorder );

    // Add labels
    if( (s == 0 || s == colors.length-1) && legend.labels ){
      var text = draw.plain(s==0? legendMin : legendMax);
      text.font({
        family: legend.fontFamily,
        size: legend.fontSize,
        weight: legend.fontWeight,
        anchor: 'middle',
        fill: legend.fontColor
      });
      text.addClass('legend');
      labelOffset = text.bbox().h 
      text.amove( tile.x() + (tileSize / 2) , y + tileSize + labelOffset );
      group.add(text);
    }

    if(tooltip && tile && isFinite(min) && isFinite(max) ){
      let bins = createBins( transformValue(min, transform.fn), transformValue(max, transform.fn), colors.length);
      let tip = `${NumberFormat.format(bins[s][0])}${legend.suffix} to ${NumberFormat.format(bins[s][1])}${legend.suffix}`
      tile.add( draw.element('title').words( tip ) );
    }
    group.add(tile);
  }

  return y += tileSize + labelOffset;

}
