import Chart from 'chart.js';
import throttle from 'lodash-es/throttle';

const { _isPointInArea } = Chart.canvasHelpers;

function getXAxis(chartInstance) {
  var scales = chartInstance.scales;
  var scaleIds = Object.keys(scales);
  for (var i = 0; i < scaleIds.length; i++) {
    var scale = scales[scaleIds[i]];

    if (scale.isHorizontal()) {
      return scale;
    }
  }
}

function getYAxis(chartInstance) {
  var scales = chartInstance.scales;
  var scaleIds = Object.keys(scales);
  for (var i = 0; i < scaleIds.length; i++) {
    var scale = scales[scaleIds[i]];

    if (!scale.isHorizontal()) {
      return scale;
    }
  }
}

function isAllowVertical(direction) {
  return direction === 'all' || direction === 'vertical';
}

function isAllowHorizontal(direction) {
  return direction === 'all' || direction === 'horizontal';
}

/**
* Get drag area
* @param {Chart} chartInstance chart instance
* @param {MouseEvent} beginPoint begin event
* @param {MouseEvent} endPoint end event
*/
function getDragArea(chartInstance, beginPoint, endPoint) {
  const props = chartInstance.$dragzone;
  const options = props._options;

  const xAxis = getXAxis(chartInstance);
  const yAxis = getYAxis(chartInstance);

  let startX = xAxis.left;
  let endX = xAxis.right;
  let startY = yAxis.top;
  let endY = yAxis.bottom;

  if (isAllowHorizontal(options.direction)) {
    const offsetX = beginPoint.target.getBoundingClientRect().left;
    startX = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
    endX = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;
  }

  if (isAllowVertical(options.direction)) {
    const offsetY = beginPoint.target.getBoundingClientRect().top;
    startY = Math.min(beginPoint.clientY, endPoint.clientY) - offsetY;
    endY = Math.max(beginPoint.clientY, endPoint.clientY) - offsetY;
  }

  return {
    startX, startY,
    endX, endY,
  };
};

/**
* Get data for point
* @param {Chart} chart Chart chartInstance
* @param {ChartElement} point Chart point data
*/
function getPointData(chart, point) {
  const datasetIndex = point._datasetIndex;
  const dataIndex = point._index;

  return chart.data.datasets[datasetIndex].data[dataIndex];
}

function isClickArea(direction, startX, endX, startY, endY) {
  if (direction === 'all') return startX === endX && startY === endY;
  if (direction === 'vertical') return startY === endY;
  if (direction === 'horizontal') return startX === endX;
  return false;
}

// Set plugin default global options
Chart.defaults.global.plugins.dragzone = {
  direction: 'all',
};

const dragZonePlugin = {
  id: 'dragzone',

  beforeInit(chartInstance) {
    chartInstance.$dragzone = {};

    const options = chartInstance.options.plugins.dragzone;
    const props = chartInstance.$dragzone;
    const node = chartInstance.ctx.canvas;
    props._node = node;
    props._options = options;

    props._mouseDownHandler = function (evt) {
      node.addEventListener('mousemove', props._mouseMoveHandler);
      props._dragZoneStart = evt;
    };

    props._mouseMoveHandler = function (evt) {
      if (props._dragZoneStart) {
        props._dragZoneEnd = evt;

        // throttle update every 100ms
        throttle(() => {
          chartInstance.update();
        }, 100);
      }
    };

    props._mouseUpHandler = function (evt) {
      if (!props._dragZoneStart) {
        return;
      }

      node.removeEventListener('mousemove', props._mouseMoveHandler);

      const beginPoint = props._dragZoneStart;
      const { startX, startY, endX, endY } = getDragArea(chartInstance, beginPoint, evt);

      props._dragZoneStart = null;
      props._dragZoneEnd = null;

      // ignore click only event
      if (isClickArea(options.direction, startX, endX, startY, endY)) return;

      const area = {
        left: startX,
        right: endX,
        top: startY,
        bottom: endY,
      };

      const datasets = chartInstance.data.datasets;
      const datasetPoints = [];

      for (let i = 0; i < datasets.length; i++) {
        const data = chartInstance.getDatasetMeta(i).data;

        for (let j = 0; j < data.length; j++) {
          const point = data[j];

          // check point in drag area
          if (_isPointInArea(point._model, area)) {
            let datas = datasetPoints[point._datasetIndex];

            if (datas === undefined) {
              datas = [];
              datasetPoints[point._datasetIndex] = datas;
            }

            datas.push(getPointData(chartInstance, point));
          }
        }
      }

      if (typeof options.onDragSelection === 'function') {
        options.onDragSelection(datasetPoints);
      }
    };

    // add drag event listener
    node.addEventListener('mousedown', props._mouseDownHandler);
    node.ownerDocument.addEventListener('mouseup', props._mouseUpHandler);
  },

  beforeDatasetsDraw(chartInstance) {
    const props = chartInstance.$dragzone;

    if (props._dragZoneEnd) {
      const ctx = chartInstance.ctx;
      const options = props._options;
      const beginPoint = props._dragZoneStart;
      const endPoint = props._dragZoneEnd;
      const { startX, startY, endX, endY } = getDragArea(chartInstance, beginPoint, endPoint);

      const rectWidth = endX - startX;
      const rectHeight = endY - startY;

      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = options.color || 'rgba(70,146,202,0.3)';
      ctx.fillRect(startX, startY, rectWidth, rectHeight);

      ctx.restore();
    }
  },

  destroy(chartInstance) {
    if (!chartInstance.$dragzone) return;

    const props = chartInstance.$dragzone;
    const node = props._node;

    node.removeEventListener('mousedown', props._mouseDownHandler);
    node.removeEventListener('mousemove', props._mouseMoveHandler);
    node.ownerDocument.removeEventListener('mouseup', props._mouseUpHandler);

    delete chartInstance.$dragzone;
  }
};

// Register chart.js plugin
Chart.plugins.register(dragZonePlugin);

export default dragZonePlugin;
