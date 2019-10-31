import babel from 'rollup-plugin-babel'
import node from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'

const extensions = ['.js', '.ts', '.tsx']

export default [
  {
    input: {
      core: './packages/core/index.tsx',
      terser: './packages/transformer-terser/index.ts',
      babel: './packages/transformer-babel/index.ts',
    },
    external: id => {
      if (['fs', 'path', 'buffer', 'os', 'lodash', 'chalk'].includes(id))
        return true
      // console.log(id)
      return /lodash/.test(id)
    },
    plugins: [node({ extensions }), babel({ extensions }), json()],
    output: {
      format: 'esm',
      dir: 'dist',
      sourcemap: true,
    },
  },
  {
    input: {
      'terser-worker': './packages/transformer-terser/worker.ts',
      'babel-worker': './packages/transformer-babel/worker.ts',
    },
    output: {
      format: 'esm',
      dir: 'dist',
    },
    plugins: [node({ extensions }), babel({ extensions })],
  },
]
