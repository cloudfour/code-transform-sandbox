import { nodeResolve } from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import linaria from 'linaria/rollup.js'
import css from 'rollup-plugin-css-only'
import mri from 'mri'
import * as fs from 'fs'
import * as rollup from 'rollup'
import { terser } from 'rollup-plugin-terser'

import babelConfig from './babel.config.cjs'

const allPackages = fs.readdirSync('packages')

const extensions = ['.js', '.ts', '.tsx']

/** @returns {import('rollup').Plugin} */
const customResolver = () => {
  return {
    name: 'custom-resolver',
    resolveId(source) {
      if (allPackages.includes(source)) {
        return { external: true, id: `./${source}.js` }
      }
    },
  }
}

/** @type {Record<string, import('rollup').RollupOptions>} */
const overrides = {
  ui: {
    input: {
      ui: 'packages/ui',
    },
    plugins: [
      customResolver(),
      nodeResolve({ extensions }),
      linaria({ sourceMap: false }),
      css({ output: 'dist/styles.css' }),
      // @ts-ignore
      babel.babel({ extensions, babelHelpers: 'bundled' }),
    ],
    output: {
      dir: 'dist',
    },
  },
}
const main = async () => {
  const args = mri(process.argv.slice(2), { boolean: ['watch'] })
  const isWatch = Boolean(args.watch)
  if (args._.length === 0) {
    throw new Error('specify which packages to build')
  }
  const packagesToBuild = args._.includes('all') ? allPackages : args._
  const configs = packagesToBuild.map((packageName) => {
    if (overrides[packageName]) return overrides[packageName]
    /** @type {import('rollup').RollupOptions} */
    const config = {
      input: { [packageName]: `packages/${packageName}` },
      plugins: [
        nodeResolve({ extensions }),
        // @ts-ignore
        babel.babel({
          extensions,
          babelHelpers: 'bundled',
          ...babelConfig,
          plugins: [...babelConfig.plugins, 'babel-plugin-un-cjs'],
        }),
        terser({ module: true, ecma: 2020, compress: { passes: 500 } }),
      ],
      output: { dir: 'dist' },
    }
    return config
  })

  if (isWatch) {
    const watcher = rollup.watch(configs)
    watcher.on('event', (event) => {
      if (event.code === 'BUNDLE_START') {
        console.log('building:', event.input)
      } else if (event.code === 'BUNDLE_END') {
        const duration = `${Math.round(event.duration / 100) / 10}s`
        console.log(`finished build (${duration}):`, event.input)
      } else if (event.code === 'ERROR') {
        console.log(`Build failed:

${event.error.frame}

${event.error.message}`)
      }
    })
  } else {
    await Promise.all(
      configs.map(async (c) => {
        const bundle = await rollup.rollup(c)
        if (!c.output) {
          console.warn('build is missing output', c.input)
          return
        }
        const outputs = Array.isArray(c.output) ? c.output : [c.output]
        await Promise.all(outputs.map((o) => bundle.write(o)))
        console.log('completed build:', c.input)
      }),
    )
  }
}

main().catch((error) => {
  console.error('error with build:\n', error)
})
