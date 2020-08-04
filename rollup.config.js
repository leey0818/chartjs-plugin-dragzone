import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const dependencies = Object.keys(pkg.dependencies);
const peerDependencies = Object.keys(pkg.peerDependencies);
const allDependencies = dependencies.concat(peerDependencies);

export default {
  input: 'src/index.js',
  output: {
    name: 'ChartDragzone',
    file: `dist/${pkg.name}.js`,
    format: 'umd',
    indent: false,
    globals: {
      'chart.js': 'Chart',
    },
  },
  external: allDependencies,
  plugins: [
    commonjs({
      include: 'node_modules/**',
    }),
    resolve(),
  ]
};
