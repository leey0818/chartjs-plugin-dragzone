import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'ChartDragzone',
      file: pkg.main,
      format: 'umd',
      indent: false,
      globals: {
        'chart.js': 'Chart',
        'chart.js/helpers': 'Chart.helpers'
      },
    },
    external: ['chart.js', 'chart.js/helpers'],
    plugins: [resolve()],
  },
  {
    input: 'src/index.esm.js',
    output: {
      file: pkg.module,
      format: 'esm',
      indent: false,
    },
    external: ['chart.js', 'chart.js/helpers'],
    plugins: [resolve()],
  }
];
