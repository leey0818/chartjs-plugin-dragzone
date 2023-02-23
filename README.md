# chartjs-plugin-dragzone

[![npm](https://img.shields.io/npm/v/chartjs-plugin-dragzone)](https://www.npmjs.com/package/chartjs-plugin-dragzone)

A Chart.js plugin to provide drag area selection.
Compatible with Chart.js v3 (>= v1.0.0)

## Installation

Install package with `npm`:

```bash
npm install chartjs-plugin-dragzone --save
```

## Usage

```javascript
import { Chart } from 'chart.js';
import ChartDragzone from 'chartjs-plugin-dragzone';

// Register the plugin to all charts
Chart.register(ChartDragzone);

// OR only to specific charts:
new Chart(ctx, {
  plugins: [ChartDragzone],
  options: {
    // ...
  }
});
```


Add plugin options to chart configuration.

```javascript
plugins: {
  dragzone: {
    // Color the drag area
    color: 'rgba(70,146,202,0.3)',

    // This function calls the selected data after the drag is completed.
    // It is stored for each dataset.
    onDragSelection: function (datasets, chart) {
      const datas = datasets[0];
      console.log('Selected data: ' + datas.length);
    }
  }
}
```
