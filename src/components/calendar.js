/**
 * Calendar Element
 */

import chroma from 'chroma-js'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import isoWeek from 'dayjs/plugin/isoWeek'
import isToday from 'dayjs/plugin/isToday'
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(localeData);
dayjs.extend(isoWeek);
dayjs.extend(isToday);
dayjs.extend(minMax);

import round from 'lodash/round'
import {transformValue} from '../components/transform'

const calendar = ( draw, {x, y, data = [], weekStart = 1, tileSize = 16, tileColor = "#dddddd", tileFuture = true, tileShape= "rectangle", tilePadding = 4.5, monthPadding = 10, monthGap = true, calendarMonthLabels = false, calendarWeekLabels = false,  scale = false, legend = false, transform = false, tooltip = false, dataInput = false } = {}) => {

  // Initial variables
  let offset_x = x;
  let offset_y = y + 20;
  let end_y = offset_y;
  let max_x = 0
  let tileBorder = chroma(tileColor).darken(2).hex();

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

  let minData = Math.min( ...data.filter(e=> (e.value || e[dataInput.valueColumn]) !== null).map( e => e.value || e[dataInput.valueColumn]) )
  let maxData = Math.max( ...data.filter(e=> (e.value || e[dataInput.valueColumn]) !== null).map( e => e.value || e[dataInput.valueColumn]) )

  // Format the date column to make the rendering later on faster
  let dataFormatted = data.map( e => {
    if (e.date !==undefined)
      e.date = dayjs(e.date).format('YYYY-MM-DD');
    else
      e[dataInput.dateColumn] = dayjs(e[dataInput.dateColumn]).format('YYYY-MM-DD');
    return e;
  });

  if(minMonth && dataInput){
    startDate = minMonth.startOf('month')
    months = Math.ceil(maxMonth.diff(minMonth, 'month', true))
  }

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

    // Hack to guess the spacing, since we can't use text.length()
    let fontFactor = (calendarWeekLabels.format == 'dddd')? 1.6 : 1.1; 
    weeklabelWidth = Math.max( ...weekdays.map(e => e.length)) * ( calendarWeekLabels.fontSize / fontFactor );
    offset_x += weeklabelWidth;
  }

  // Build calendar months
  for(let t=0; t<months; t++){

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

        // Add Weekday Labels before the first month
        if(t == 0 && m == 0 && calendarWeekLabels){

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
            text.move(offset_x - (weeklabelWidth - tilePadding) , y + Number(calendarWeekLabels.fontSize) + 1 );
          }
        }
        
        // Calculate x,y positions
        x = (offset_x + ((tilePadding + tileSize) * m))
        y = (offset_y + ((tilePadding + tileSize) * w))

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
            tip = dayData? `${value !== null? `${value}${legend? legend.suffix : ''}` : 'NaN' } on ${tip}` : tip
          }
          tile.add( draw.element('title').words( tip ) );
        }

        // Set up for future days
        if (startDate.isToday() && tileFuture){
          tileColor = chroma(tileColor).brighten(0.5);
        }

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
    if(calendarMonthLabels){
      let text = draw.plain(startDate.subtract(1, 'day').format(calendarMonthLabels.format));
      if(calendarMonthLabels.textAlignment == 'middle') {
        text.move( offset_x + ( tileSize + x - offset_x )/2, end_y + Number(calendarMonthLabels.fontSize) + tilePadding );
      }
      else if(calendarMonthLabels.textAlignment == 'end') {
        text.move( (x + tileSize), end_y + Number(calendarMonthLabels.fontSize) + tilePadding);
      }
      else {
        text.move(offset_x, end_y + Number(calendarMonthLabels.fontSize) + tilePadding );
      }
  
      text.font({
        family: calendarMonthLabels.fontFamily, 
        size: calendarMonthLabels.fontSize,
        weight: calendarMonthLabels.fontWeight,
        anchor: calendarMonthLabels.textAlignment,
        fill: calendarMonthLabels.fontColor
      });


    }

    // calculate offset for next month
    offset_x = x;
    if(monthGap)
      offset_x += monthPadding + tileSize;
  }

  // calculate offset
  offset_y += (tileSize * 7) + (tilePadding * 6) + tileSize * 1.5

  if(calendarMonthLabels){
    offset_y += Number(calendarMonthLabels.fontSize)
  }

  // Legend
  if(legend){
    offset_y = drawLegend( draw, offset_x, offset_y, colors, minData, maxData, tileShape, tileBorder, tileSize, tilePadding, monthGap, monthPadding, legend, transform, tooltip );
  }
  
  // Set size and viewbox
  let viewboxWidth = (max_x + tileSize + 20)  
  draw.size(viewboxWidth, offset_y+30);

  draw.viewbox(`0 0 ${ viewboxWidth   } ${draw.height()}`);
  
  return null;
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
      { "type": "select", "name": "tileShape", "value": 'rectangle', options: ["rectangle", "circle"], "label": "Tile Shape"},
      { "type": "color", "name": "tileColor", "value": "#dddddd", "label": "Tile Color" },
      { "type": "check", "name": "tileFuture", "value": true, "label": "Future Days (highlight)" },
      { "type": "range", "name": "tilePadding", "value": 4.5, "label": "Tile Padding", "step": 0.5, "min": 0, "max": 10 },
      { "type": "range", "name": "monthPadding", "value": 10, "label": "Month Padding", "step": 1, "min": 0, "max": 50 },
      { "type": "check", "name": "monthGap", "value": true, "label": "Gap between Months" },
      { "type": "select", "name": "weekStart", "value": 0, options: [
          {value: 1, name: 'Monday'},
          {value: 2, name: 'Tuesday'},
          {value: 3, name: 'Wednesday'},
          {value: 4, name: 'Thursday'},
          {value: 5, name: 'Friday'},
          {value: 6, name: 'Saturday'},
          {value: 0, name: 'Sunday'},
        ], "label": "Week Start"},
    ]
  }
}

// Create bins
function createBins(min, max, numBins) {

  const step = (max - min) / numBins;

  const bins = [];

  for (let i = 0; i < numBins; i++) {
    bins.push([i * step + min, (i + 1) * step + min]); 
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

  return tile;
}

// Draw the legend
const drawLegend = ( draw, x, y, colors, min, max, tileShape, tileBorder, tileSize, tilePadding, gap, gapPadding, legend, transform, tooltip ) => {

  // Legend
  let legendMin = Number.isFinite(min)? min : 'Min'
  let legendMax = Number.isFinite(max)? max : 'Max'
  let x_init = x

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
    legendMin = round(transformValue(min, transform.fn),2) || 'Min'
    legendMax = round(transformValue(max, transform.fn),2) || 'Max'
  }

  if(legend.suffix != ''){
    if(legendMin != 'Min') legendMin += legend.suffix;
    if(legendMax != 'Max') legendMax += legend.suffix;
  }

  for(let s = 0; s < colors.length; s++){    

    // Add tile
    let tile = drawTile( draw, (x_init + ((tilePadding + tileSize) * s)), y, tileShape, tileSize, colors[s], tileBorder );

    // Add labels
    if( (s == 0 || s == colors.length-1) && legend.labels ){
      var text = draw.plain(s==0? legendMin : legendMax);
      text.move( tile.x() + (tileSize / 2) , y + Number(legend.fontSize) + tilePadding / 2 );
      text.font({
        family: legend.fontFamily,
        size: legend.fontSize,
        weight: legend.fontWeight,
        anchor: 'middle',
        fill: legend.fontColor
      });
      group.add(text);
    }

    if(tooltip && tile){
      let bins = createBins( transformValue(min, transform.fn), transformValue(max, transform.fn), colors.length);
      let tip = `${round(bins[s][0],2)}${legend.suffix} to ${round(bins[s][1],2)}${legend.suffix}`
      tile.add( draw.element('title').words( tip ) );
    }
    group.add(tile);
  }

  return y += tileSize;

}
