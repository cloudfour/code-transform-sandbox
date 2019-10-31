import * as watcher from '@parcel/watcher'
import * as Path from 'path'
import mri from 'mri'
import 'loud-rejection/register'
import * as kleur from 'kleur'
import figures from 'figures'
import ansiEscapes from 'ansi-escapes'
// eslint-disable-next-line caleb/node/no-unsupported-features/node-builtins
import { Worker } from 'worker_threads'
import { cpus } from 'os'
import wrapAnsi from 'wrap-ansi'
import globrex = require('globrex')
import tinyGlob = require('tiny-glob')

export interface WorkerMessage {
  status?: Status
  messageType?: 'stderr' | 'stdout'
  data?: any
}

const check = kleur.green().bold(figures('✔'))
const yellowCheck = kleur.yellow().bold(figures('✔'))
const x = kleur.red().bold(figures('✖'))
const info = kleur
  .dim()
  .cyan()
  .bold(figures('ℹ'))

const exitWithError = (message: string) => {
  console.error(`${x} ${message}`)
  process.exit(1)
}

const args = mri(process.argv.slice(2), {
  alias: { i: 'incremental', w: 'watch' },
  boolean: ['incremental', 'watch'],
  unknown: flag => {
    exitWithError(`Unrecognized flag: ${kleur.bold(flag)}`)
  },
})

if (args._.length !== 0) {
  exitWithError(`Unexpected input: ${args._.map(kleur.bold).join(', ')}`)
}

const subProjectsGlob = './packages/*'

const subProjectsRegexp = globrex(subProjectsGlob.replace(/^\.\//, ''), {
  filepath: true,
}).path.segments

const subProjectsToRebuild = new Set<string>()

const getEventSubproject = ({ path }: watcher.FileEvent) => {
  const relativePath = Path.relative(process.cwd(), path)
  const pathChunks = relativePath.split(Path.sep)
  const matchingSubproject = subProjectsRegexp.map((chunkRegex, i) => {
    if (!pathChunks[i]) return null
    const match = chunkRegex.exec(pathChunks[i])
    return match && match[0]
  })

  if (matchingSubproject.some(chunk => chunk === null)) return false

  return matchingSubproject.join(Path.sep)
}

const getFreeWorker = (preferred = 0) => {
  const preferredWorker = workers[preferred]
  if (preferredWorker.currentProject === null) return preferredWorker
  return workers.find(w => w.currentProject === null)
}

const enqueueSubprojectBuild = (p: string) => {
  subProjectsToRebuild.add(p)
  progress.set(p, {
    worker: null,
    ...progress.get(p),
    status: 'waiting',
    warnings: undefined,
  })
  flushProjectRebuildQueue()
}

const flushProjectRebuildQueue = async () => {
  if (subProjectsToRebuild.size === 0) return
  // Find the first task whose preferred worker is free
  const firstTaskWithFreeWorker = [...subProjectsToRebuild].find(proj => {
    const projStatus = progress.get(proj)
    // If this project hasn't been compiled before, it has no preferred worker,
    // So it would be better to continue and find a project with a preferred worker
    // Because this one can fit in "anywhere"
    if (!projStatus || projStatus.worker === null) return false
    // Return whether the project's preferred worker is free
    return workers[projStatus.worker].currentProject === null
  })
  // If no project has its preferred worker free, just do the first task
  const firstTask = firstTaskWithFreeWorker || [...subProjectsToRebuild][0]
  const taskProgress = progress.get(firstTask)
  const worker = getFreeWorker(
    (taskProgress && taskProgress.worker) || undefined,
  )
  if (worker) {
    subProjectsToRebuild.delete(firstTask)
    worker.currentProject = firstTask
    progress.set(firstTask, {
      status: 'building',
      worker: worker.index,
      timeStart: new Date().getTime(),
    })
    // Start up the next task, if there is a worker available and a task available
    flushProjectRebuildQueue()
    await new Promise(resolve => {
      worker.worker.postMessage(firstTask)
      const messageListener = (message: WorkerMessage) => {
        const existingProgress = progress.get(firstTask) || {
          status: 'building',
          worker: worker.index,
        }
        if (message.status) existingProgress.status = message.status
        if (message.status === 'done')
          existingProgress.timeEnd = new Date().getTime()
        if (message.messageType && message.data !== undefined) {
          existingProgress.warnings =
            (existingProgress.warnings || '') + message.data
        }
        progress.set(firstTask, existingProgress)
        if (message.status === 'done') {
          resolve()
          worker.worker.removeListener('message', messageListener)
        }
      }
      worker.worker.on('message', messageListener)
    })
    worker.currentProject = null
    // Start up the next task, if there is a task available, because this worker has become free
    flushProjectRebuildQueue()
  }
  // If there is no worker, we don't need to do anything here.
  // When a worker finishes a task (becomes free) flushProjectRebuildQueue will be called again.
}

const enqueueFileEvents = (fileEvents: watcher.FileEvent[]) => {
  fileEvents.map(getEventSubproject).forEach(project => {
    if (project) enqueueSubprojectBuild(project)
  })
  saveSnapshot()
}

const snapshotPath = Path.join(process.cwd(), 'snapshot.txt')
const saveSnapshot = () => watcher.writeSnapshot(process.cwd(), snapshotPath)

const watcherOpts: watcher.WatcherOpts = {
  ignore: [snapshotPath],
}

type Status = 'waiting' | 'building' | 'writing' | 'done'
interface WorkerState {
  worker: number | null
  status: Status
  warnings?: string
  timeStart?: number
  timeEnd?: number
}
const progress = new Map<string, WorkerState>()

// const numWorkers = Math.max(cpus().length - 1, 1)
const numWorkers = 3

const workers: {
  worker: Worker
  currentProject: string | null
  index: number
}[] = []
for (let i = 0; i < numWorkers; i++) {
  // eslint-disable-next-line caleb/node/no-missing-require
  const worker = new Worker(require.resolve('./build-subproject.js'), {})
  workers[i] = {
    worker,
    currentProject: null,
    index: i,
  }
}

const buildAllSubprojects = async () => {
  const allProjects = await tinyGlob(subProjectsGlob.replace(/^\.\//, ''), {
    cwd: process.cwd(),
  })
  allProjects.forEach(enqueueSubprojectBuild)
}

if (args.incremental) console.info(`${info} Building in incremental mode`)
if (args.watch) console.info(`${info} Watching for changes`)

let prevLineCount = 0
const stdoutRaw = process.stdout.write.bind(process.stdout)
const stderrRaw = process.stderr.write.bind(process.stderr)
const output = (data: string | Uint8Array) =>
  ansiEscapes.eraseLines(prevLineCount) +
  data +
  ansiEscapes.cursorDown(prevLineCount) +
  '\n'.repeat(data.toString().split('\n').length - 1)

process.stdout.write = (data: string | Uint8Array): any => {
  stdoutRaw(output(data))
  rerender()
}
process.stderr.write = (data: string | Uint8Array): any => {
  stderrRaw(output(data))
  rerender()
}

let lastOutput = ''

const rerender = () => {
  const cols = (process.stdout.columns || 80) - 2
  const lines = [...progress].map(([projName, status]) => {
    const timeInfo =
      (status.timeEnd &&
        status.timeStart &&
        kleur.gray(` ${Math.round(status.timeEnd - status.timeStart)}ms`)) ||
      ''
    const icon =
      status.status === 'building'
        ? kleur.yellow('B')
        : status.status === 'done'
        ? status.warnings === undefined
          ? check
          : yellowCheck
        : status.status === 'waiting'
        ? 'L'
        : 'W'
    const mainLine = `${icon} ${
      status.worker === null ? ' ' : status.worker
    } ${kleur.bold(projName)}${timeInfo}`
    if (status.warnings === undefined) return mainLine
    const warnings = wrapAnsi(status.warnings.trim(), cols)
      .split('\n')
      .map(l => '  ' + l)
      .join('\n')
    return `${mainLine}
${warnings}`
  })
  const output = '\n' + lines.join('\n') + '\n'
  if (output === lastOutput) return
  lastOutput = output
  stdoutRaw(ansiEscapes.eraseLines(prevLineCount))
  prevLineCount = output.split('\n').length
  stdoutRaw(output)
}

const rerenderIntervalId = setInterval(rerender, 20)

const main = async () => {
  if (args.watch) {
    // Subscribe to events
    await watcher.subscribe(
      process.cwd(),
      (err, events) => {
        if (err !== null) console.log('error', err)
        enqueueFileEvents(events)
      },
      watcherOpts,
    )
  }

  // Get events since some saved snapshot in the past
  const events = await watcher.getEventsSince(
    process.cwd(),
    snapshotPath,
    watcherOpts,
  )

  enqueueFileEvents(events)
  if (!args.incremental) await buildAllSubprojects()
}

main()
