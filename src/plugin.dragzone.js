import { callback, merge } from 'chart.js/helpers';
import throttle from 'lodash-es/throttle';

const isPointInArea = (point, area) => {
  return point.x >= area.left && point.x <= area.right
    && point.y >= area.top && point.y <= area.bottom;
};

const getCanvasPosition = (chart, event) => {
  const rect = chart.canvas.getBoundingClientRect();
  const offsetX = rect.left;
  const offsetY = rect.top;

  return {
    x: event.clientX - offsetX,
    y: event.clientY - offsetY,
  };
};

/**
* Get drag area
*/
function getDragArea(chart, startPos, endPos) {
  return {
    startX: Math.min(startPos.x, endPos.x),
    startY: Math.min(startPos.y, endPos.y),
    endX: Math.max(startPos.x, endPos.x),
    endY: Math.max(startPos.y, endPos.y),
  };
};

function isClickArea(startX, endX, startY, endY) {
  return startX === endX && startY === endY;
}

const defaultOptions = {
  color: '#4692ca4d',
};

export default {
  id: 'dragzone',

  beforeInit(chart) {
    const dragzone = chart.$dragzone = chart.$dragzone || {};
    const options = dragzone.options = merge({}, [defaultOptions, chart.options.plugins?.dragzone || {}]);
    const canvas = dragzone.canvas = chart.canvas;
    const throttledUpdate = throttle(() => chart.update('none'), 50);
    const mouseMoveEventListener = dragzone.mouseMoveEventListener = (event) => {
      if (dragzone._dragzoneStart) {
        dragzone._dragzoneEnd = getCanvasPosition(chart, event);

        // throttle update every 50ms
        throttledUpdate();
      }
    };
    const mouseDownEventListener = dragzone.mouseDownEventListener = (event) => {
      canvas.addEventListener('mousemove', mouseMoveEventListener);
      dragzone._dragzoneStart = getCanvasPosition(chart, event);
    };
    const mouseUpEventListener = dragzone.mouseUpEventListener = (event) => {
      if (!dragzone._dragzoneStart) return;

      canvas.removeEventListener('mousemove', mouseMoveEventListener);

      const beginPoint = dragzone._dragzoneStart;
      const endPoint = getCanvasPosition(chart, event);
      const { startX, startY, endX, endY } = getDragArea(chart, beginPoint, endPoint);

      dragzone._dragzoneStart = null;
      dragzone._dragzoneEnd = null;
      throttledUpdate();

      // ignore click only event
      if (isClickArea(startX, endX, startY, endY)) return;

      const area = {
        left: startX,
        right: endX,
        top: startY,
        bottom: endY,
      };

      const datasets = chart.data.datasets;
      const datasetPoints = [];

      for (let i = 0; i < datasets.length; i++) {
        const data = chart.getDatasetMeta(i).data;

        for (let j = 0; j < data.length; j++) {
          const point = data[j];

          // check point in drag area
          if (isPointInArea(point, area)) {
            const pointDatas = datasetPoints[i] = datasetPoints[i] || [];
            const pointData = chart.data.datasets[i].data[j];
            pointDatas.push(pointData);
          }
        }
      }

      if (typeof options.onDragSelection === 'function') {
        callback(options.onDragSelection, [datasetPoints, chart], chart);
        // options.onDragSelection(datasetPoints);
      }
    };

    // add drag event listener
    canvas.addEventListener('mousedown', mouseDownEventListener);
    canvas.ownerDocument.addEventListener('mouseup', mouseUpEventListener);
  },

  beforeDatasetsDraw(chart) {
    const dragzone = chart.$dragzone;

    if (dragzone._dragzoneEnd) {
      const ctx = chart.ctx;
      const options = dragzone.options;
      const beginPoint = dragzone._dragzoneStart;
      const endPoint = dragzone._dragzoneEnd;
      const { startX, startY, endX, endY } = getDragArea(chart, beginPoint, endPoint);
      const rectWidth = endX - startX;
      const rectHeight = endY - startY;

      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = options.color;
      ctx.fillRect(startX, startY, rectWidth, rectHeight);

      ctx.restore();
    }
  },

  beforeDestroy(chart) {
    if (!chart.$dragzone) return;

    const dragzone = chart.$dragzone;
    const canvas = chart.canvas;

    canvas.removeEventListener('mousedown', dragzone.mouseDownEventListener);
    canvas.removeEventListener('mousemove', dragzone.mouseMoveEventListener);
    canvas.ownerDocument.removeEventListener('mouseup', dragzone.mouseUpEventListener);

    delete chart.$dragzone;
  }
};
