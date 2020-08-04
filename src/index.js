import Chart from 'chart.js';

var _isPointInArea = Chart.canvasHelpers._isPointInArea;

function getDragArea(beginPoint, endPoint) {
  var offsetX = beginPoint.target.getBoundingClientRect().left;
  var startX = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
  var endX = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;

  var offsetY = beginPoint.target.getBoundingClientRect().top;
  var startY = Math.min(beginPoint.clientY, endPoint.clientY) - offsetY;
  var endY = Math.max(beginPoint.clientY, endPoint.clientY) - offsetY;

  return {
    startX, startY,
    endX, endY,
  };
};

function getPointData(chart, point) {
  var datasetIndex = point._datasetIndex;
  var dataIndex = point._index;

  return chart.data.datasets[datasetIndex].data[dataIndex];
}

var dragZonePlugin = {
  id: 'dragzone',

  beforeInit: function (chartInstance, pluginOptions) {
    var node = chartInstance.ctx.canvas;

    chartInstance.$dragzone = {
      _node: node,
    };

    chartInstance.$dragzone._mouseDownHandler = function (evt) {
      node.addEventListener('mousemove', chartInstance.$dragzone._mouseMoveHandler);
      chartInstance.$dragzone._dragZoneStart = evt;
    };

    chartInstance.$dragzone._mouseMoveHandler = function (evt) {
      if (chartInstance.$dragzone._dragZoneStart) {
        chartInstance.$dragzone._dragZoneEnd = evt;
        chartInstance.update(0);
      }
    };

    chartInstance.$dragzone._mouseUpHandler = function (evt) {
      if (!chartInstance.$dragzone._dragZoneStart) {
        return;
      }

      node.removeEventListener('mousemove', chartInstance.$dragzone._mouseMoveHandler);

      var beginPoint = chartInstance.$dragzone._dragZoneStart;
      var { startX, startY, endX, endY } = getDragArea(beginPoint, evt);

      chartInstance.$dragzone._dragZoneStart = null;
      chartInstance.$dragzone._dragZoneEnd = null;

      var area = {
        left: startX,
        right: endX,
        top: startY,
        bottom: endY,
      };

      var data = chartInstance.getDatasetMeta(0).data;
      var points = [];

      for (let i = 0; i < data.length; i++) {
        var point = data[i];

        if (_isPointInArea(point._model, area)) {
          points.push(getPointData(chartInstance, point));
        }
      }

      console.log('contain points: ' + points.length);

      // chartInstance.update(0);
    };
  },

  beforeUpdate: function (chart) {
    var props = chart.$dragzone;
    var node = props._node;

    node.addEventListener('mousedown', props._mouseDownHandler);
    node.ownerDocument.addEventListener('mouseup', props._mouseUpHandler);
  },

  beforeDatasetsDraw: function (chartInstance) {
    var ctx = chartInstance.ctx;
    var props = chartInstance.$dragzone;

    if (props._dragZoneEnd) {
      var beginPoint = props._dragZoneStart;
      var endPoint = props._dragZoneEnd;
      var { startX, startY, endX, endY } = getDragArea(beginPoint, endPoint);

      var rectWidth = endX - startX;
      var rectHeight = endY - startY;

      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.fillStyle = '#4692ca4d';
      ctx.fillRect(startX, startY, rectWidth, rectHeight);

      ctx.restore();
    }
  },

  destroy: function (chartInstance) {
    if (!chartInstance.$dragzone) return;

    var props = chartInstance.$dragzone;
    var node = props._node;

    node.removeEventListener('mousedown', props._mouseDownHandler);
    node.removeEventListener('mousemove', props._mouseMoveHandler);
    node.ownerDocument.removeEventListener('mouseup', props._mouseUpHandler);

    delete chartInstance.$dragzone;
  }
};

Chart.plugins.register(dragZonePlugin);
export default dragZonePlugin;
