# chartjs-plugin-dragzone

A Chart.js plugin to provide drag area selection.

## Installation

Install package with `npm`:

```bash
npm install chartjs-plugin-dragzone
```

## Usage

Import the module from where you want to use it.

```javascript
import 'chartjs-plugin-dragzone';
```

Add plugin options to chart configuration.

```javascript
plugins: {
  dragzone: {
    // Drag directions.
    // Allow only 'vertical', 'horizontal', 'all'
    direction: 'all',

    // Color the drag area
    color: 'rgba(70,146,202,0.3)',

    // This function calls the selected data after the drag is completed.
    // It is stored for each dataset.
    onDragSelection: function (datasets) {
      const datas = datasets[0];
      console.log('Selected data: ' + datas.length);
    }
  }
}
```
