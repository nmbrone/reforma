import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  entry: 'src/Reforma.js',
  format: 'umd',
  sourceMap: true,
  moduleName: 'Reforma',
  external: ['react', 'prop-types', 'lodash.isequal'],
  exports: 'named',
  globals: {
    react: 'React',
    'prop-types': 'PropTypes',
    'lodash.isequal': 'isEqual',
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
    }),
  ].concat(isProduction ? [uglify(), filesize()] : []),
  dest: `dist/Reforma${isProduction ? '.min' : ''}.js`,
};
