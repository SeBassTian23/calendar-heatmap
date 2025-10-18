# Calendar Heatmap

> Generate a Calendar Heatmap from a date - value data source (csv, json)

![Calendar Heatmap](./images/calendar-heatmap.svg)

Visit <https://kuhlgert.com/calendar-heatmap/> to generate a calendar heatmap from a given dataset.

## Install

The installation requires you to have Node.js and NPM installed. After that run the command below to install the application.

```bash
npm install
```

## Start the Application

Run the command below to start the application.

```bash
npm start
```

## Use the Library

In case you want to use the library in your own app, find the available functions below. The HTML output of settings, presets, and references uses the classes compatible with [Bootstrap 5.x](https://getboostrap.com).

### The HTML file

```html
<!-- HTML File -->
<html>
  <script defer src="./calendarheatmap.min.js">
  <body>
    <div id="svg-container"></div>
  </body>
  ...
</html>
```

### The JavaScript File

```JavaScript
// Initiate
const calendarheatmap = new CalendarHeatmap();

// Add data (JSON or csv)
calendarheatmap.importData([
  {date: '2025-10-14T08:48:59Z', column: 1},
  {date: '2025-10-15T08:48:59Z', column: 3},
  ...
]);

// Add your Settings
calendarheatmap.settings = {
  title: {
    titleText: 'My Data'
  },
  ...
};

// Return the SVG and add to element
document.querySelector("#svg-container").innerHTML = calendarheatmap.build();
```

## Available Functions

The heatmap class provides the following functions.

### Build SVG

```JavaScript
// Build SVG (returned as string)
let svg = calendarheatmap.build();
```

### Settings

```JavaScript
// Get the current Settings (object)
let settings = calendarheatmap.settings;

// Change Settings (object)
calendarheatmap.settings = {
  title: {
    titleText: 'My Data'
  },
  ...
};

// Get the Presets as an array of objects
let presets = calendarheatmap.presets;

// Apply Preset based on position in presets array (id=<int>)
let idx = 0;
let presets = calendarheatmap.applyPreset(idx);

// Reset Settings
calendarheatmap.resetSettings();
```

### Data

```JavaScript
// Get data
let data = calendarheatmap.data;

// Set data
calendarheatmap.data = [...];

// Get Headers
let headers = calendarheatmap.headers;

// Set Headers
calendarheatmap.headers = ['Date', 'Column', ...];

// Import data (adds headers automatically)
calendarheatmap.dataImport("<data source as string>");

// Reset Settings and data
calendarheatmap.reset();
```

### HTML

The class provides HTML code for forms to access settings and presets.

```JavaScript
// Get the Settings as HTML
let settingsHTML = calendarheatmap.settingsHTML();

// Get the Presets as HTML
calendarheatmap.presetsHTML();
```

## Settings Reference

### `title`
Controls the main title display and styling.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether to display the main title |
| `titleText` | string | `"Main Title"` | The text content of the title |
| `fontFamily` | string | `"system-ui, ..."` | Font family for the title |
| `fontSize` | number | `36` | Font size in pixels |
| `fontWeight` | string | `"normal"` | Font weight (e.g., "normal", "bold") |
| `textAlignment` | string | `"left"` | Text alignment ("left", "center", "right") |
| `fontColor` | string | `"#212529"` | Hex color code for the text |

### `subtitle`
Controls the subtitle display and styling.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether to display the subtitle |
| `titleText` | string | `"Sub Title"` | The text content of the subtitle |
| `fontFamily` | string | `"system-ui, ..."` | Font family for the subtitle |
| `fontSize` | number | `24` | Font size in pixels |
| `fontWeight` | string | `"normal"` | Font weight |
| `textAlignment` | string | `"left"` | Text alignment |
| `fontColor` | string | `"#65696c"` | Hex color code for the text |

### `scale`
Defines the color scale for the heatmap. For details of some options refer to [chroma.js](https://gka.github.io/chroma.js).

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether to apply the color scale |
| `name` | string | `"YlOrRd"` | Name of the color scale ([chroma.js](https://gka.github.io/chroma.js/#chroma-brewer)) |
| `reverse` | boolean | `false` | Whether to reverse the color scale |
| `colors` | number | `5` | Number of colors in the scale |
| `mode` | string | `"rgb"` | Color interpolation mode |
| `correctLightness` | boolean | `false` | Whether to correct lightness in color interpolation |
| `gamma` | number | `1` | Gamma correction value |
| `nodata` | string | `"#eeeeee"` | Color for cells with no data |

### `legend`
Controls the legend display and styling.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether to display the legend |
| `position` | string | `"right"` | Legend position ("left", "right", "top", "bottom") |
| `suffix` | string | `""` | Suffix to append to legend values |
| `labels` | boolean | `true` | Whether to show labels in the legend |
| `fontFamily` | string | `"system-ui, ..."` | Font family for legend text |
| `fontSize` | number | `18` | Font size in pixels |
| `fontWeight` | string | `"normal"` | Font weight |
| `textAlignment` | string | `"left"` | Text alignment |
| `fontColor` | string | `"#212529"` | Hex color code for the text |

### `labels`
Controls data labels on calendar tiles.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether to display labels on tiles |
| `mode` | string | `"rgb"` | Color mode for label contrast |
| `correctLightness` | boolean | `false` | Whether to correct lightness for readability |
| `colors` | number | `5` | Number of color steps |
| `nodata` | string | `"#eeeeee"` | Color for no-data state |

### `hover`
Controls hover interaction behavior.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `false` | Whether to enable hover effects |

### `transform`
Controls data transformation.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `false` | Whether to apply data transformation |
| `fn` | string | `"log₁₀"` | Transformation function to apply |

### `tooltip`
Controls tooltip display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `false` | Whether to display tooltips |
| `format` | string | `"YYYY-MM-DD"` | Date format string |
| `data` | boolean | `true` | Whether to show data values in tooltip |

### `darkmode`
Controls dark mode support.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether dark mode styles are embedded |

### `calendar`
Controls the calendar grid layout and appearance.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether to display the calendar |
| `tileSize` | number | `16` | Size of each calendar tile in pixels |
| `tileShape` | string | `"rectangle"` | Shape of tiles ("rectangle", "circle", etc.) |
| `tileColor` | string | `"#dddddd"` | Default tile color |
| `tileFuture` | boolean | `true` | Whether to lighten the tile color of future dates |
| `tilePadding` | number | `4.5` | Padding between tiles in pixels |
| `monthPadding` | number | `10` | Padding between months in pixels |
| `monthGap` | boolean | `true` | Whether to add gaps between months |
| `weekStart` | number | `0` | First day of week (0=Sunday, 1=Monday) |
| `monthsWrapAfter` | number | `12` | Number of months before wrapping to new row |
| `monthsRowsReverse` | boolean | `false` | Whether to reverse the order of month |

### `calendar-month`
Controls month label display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether to display month labels |
| `format` | string | `"MMM 'YY"` | Date format for month labels |
| `fontFamily` | string | `"system-ui, ..."` | Font family |
| `fontSize` | number | `18` | Font size in pixels |
| `fontWeight` | string | `"normal"` | Font weight |
| `textAlignment` | string | `"middle"` | Text alignment |
| `fontColor` | string | `"#212529"` | Hex color code |

### `calendar-week`
Controls weekday label display.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `true` | Whether to display weekday labels |
| `format` | string | `"ddd"` | Date format for weekday labels (e.g., "Mon") |
| `fontFamily` | string | `"system-ui, ..."` | Font family |
| `fontSize` | number | `18` | Font size in pixels |
| `fontWeight` | string | `"normal"` | Font weight |
| `textAlignment` | string | `"left"` | Text alignment |
| `fontColor` | string | `"#212529"` | Hex color code |

### `data-input`
Controls data input configuration.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `false` | Whether data input is active |
| `dateColumn` | string | `""` | Name of the date column in input data |
| `valueColumn` | string | `""` | Name of the value column in input data |

### `i18n`
Controls internationalization settings.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `show` | boolean | `false` | Whether i18n is enabled |
| `locale` | string | `"en"` | Locale code (e.g., "en", "fr", "de") |

## Usage Example
```javascript
// Get default settings
const settings = myClass.getSettings();

// Modify specific settings
settings.title.titleText = "My Custom Title";
settings.calendar.tileSize = 20;
settings.scale.name = "Blues";

// Apply settings
myClass.applySettings(settings);
```

## Notes

- Font family defaults to system fonts for optimal cross-platform compatibility
- Color values should be provided as hex codes (e.g., `#212529`)
- Date formats follow standard formatting tokens (e.g., `YYYY`, `MM`, `DD`)
