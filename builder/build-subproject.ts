import babel from 'rollup-plugin-babel'
import { rollup, RollupCache } from 'rollup'
import node from 'rollup-plugin-node-resolve'
import * as path from 'path'
import { WorkerMessage } from '.'
// eslint-disable-next-line caleb/node/no-unsupported-features/node-builtins
import { parentPort } from 'worker_threads'
import * as kleur from 'kleur'
import figures = require('figures')

const rollupCache = new Map<string, RollupCache>()

const extensions = ['.js', '.ts', '.tsx']

const warn = kleur.yellow().bold(figures('⚠'))

const build = (name: string, listener: (message: WorkerMessage) => void) => {
  const nameChunks = name.split(path.sep)
  const realName = nameChunks[nameChunks.length - 1]
  listener({ status: 'building' })
  process.stderr.write = (data: string | Uint8Array): any => {
    listener({ messageType: 'stderr', data: data.toString() })
  }
  process.stdout.write = (data: string | Uint8Array): any => {
    listener({ messageType: 'stdout', data: data.toString() })
  }
  rollup({
    cache: rollupCache.get(name),
    context: 'undefined',
    input: { [realName]: path.join(process.cwd(), name) },
    plugins: [node({ extensions }), babel({ extensions })],
    onwarn(msg) {
      const code = (msg as string & { code?: string }).code
      // Ignore this is undefined errors
      if (!code || code !== 'THIS_IS_UNDEFINED')
        listener({ messageType: 'stderr', data: `${warn} ${msg}` })
    },
  })
    .then(build => {
      rollupCache.set(name, build.cache)
      listener({ status: 'writing' })
      build.write({
        dir: 'dist',
        format: 'esm',
      })
    })
    .then(() => {
      listener({ status: 'done' })
    })
}

if (parentPort) {
  parentPort.on('message', (project: string) => {
    build(project, message => {
      parentPort && parentPort.postMessage(message)
    })
  })
}
