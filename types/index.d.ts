import { Plugin } from 'chart.js';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    dragzone?: {
      color?: string;
      onDragSelection?: (this: Chart<TType>, datasets: unknown[][], chart: Chart<TType>) => void;
    }
  }
}

declare const plugin: Plugin;

export default plugin;
