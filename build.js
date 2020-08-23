import { nodeResolve } from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import linaria from 'linaria/rollup.js'
import css from 'rollup-plugin-css-only'
import mri from 'mri'
import * as fs from 'fs'
import * as path from 'path'
import * as rollup from 'rollup'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'

import babelConfig from './babel.config.cjs'

const packagesFolder = path.join(process.cwd(), 'packages')
const allPackages = fs.readdirSync(packagesFolder)

const extensions = ['.mjs', '.js', '.ts', '.tsx']

/** @returns {import('rollup').Plugin} */
const customResolver = () => {
  return {
    name: 'custom-resolver',
    async resolveId(source, importer) {
      if (source.startsWith('/transformer-'))
        return { id: source, external: true }
      if (!allPackages.includes(source) || !importer) return
      const relative = path.join(
        path.relative(path.dirname(importer), packagesFolder),
        source,
      )
      return this.resolve(relative, importer, { skipSelf: true })
    },
  }
}

/** @type {import('rollup').RollupOptions} */
const uiConfig = {
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
}

const main = async () => {
  const args = mri(process.argv.slice(2), { boolean: ['watch'] })
  const isWatch = Boolean(args.watch)
  const packagesToBuild = args._.length > 0 ? args._ : ['ui']
  const configs = packagesToBuild.map((packageName) => {
    /** @type {import('rollup').RollupOptions} */
    const config =
      packageName === 'ui'
        ? uiConfig
        : {
            input: { [packageName]: `packages/${packageName}/transform` },
            plugins: [
              customResolver(),
              nodeResolve({
                extensions,
                mainFields: ['browser', 'module', 'main'],
              }),
              json(),
              // @ts-ignore
              babel.babel({
                extensions,
                babelHelpers: 'bundled',
                ...babelConfig,
                plugins: [...babelConfig.plugins, 'babel-plugin-un-cjs'],
                configFile: false,
              }),
              terser({ module: true, ecma: 2020, compress: { passes: 5 } }),
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
        const errorMsg = event.error.frame
          ? `${event.error.frame}\n\n${event.error.message}`
          : event.error
        console.log(`Build failed:

${errorMsg}`)
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
