// This is the defs for the @parcel/watcher in the parcel monorepo

// declare module '@parcel/watcher' {
//   import { EventEmitter } from 'events'
//   class Watcher extends EventEmitter {
//     constructor(options?: {
//       // FS events on macOS are flakey in the tests, which write lots of files very quickly
//       // See https://github.com/paulmillr/chokidar/issues/612
//       useFsEvents?: boolean
//       ignoreInitial: boolean
//       ignorePermissionErrors: boolean
//       ignored: RegExp
//     })
//     startchild(): void
//     handleClosed(): void
//     handleEmit(event: string, data: any): void
//     sendCommand(func: () => void, args: any[]): void
//     add(paths: string[]): void
//     getWatched(): { [key: string]: string[] }
//     /**
//      * Find a parent directory of `path` which is already watched
//      */
//     getWatchedParent(path: string): string | null
//     /**
//      * Find a list of child directories of `path` which are already watched
//      */
//     getWatchedChildren(path: string): string[]
//     /**
//      * Add a path to the watcher
//      */
//     watch(path: string): void
//     /**
//      * Remove a path from the watcher
//      */
//     unwatch(path: string): void
//     /**
//      * Stop watching all paths
//      */
//     stop(): Promise<void>

//     ready: boolean
//   }

//   export default Watcher
// }

// This is the defs for the @parcel/watcher in https://github.com/parcel-bundler/watcher

declare module '@parcel/watcher' {
  type EventType = 'update' | 'create' | 'delete'
  export type FileEvent = { path: string; type: EventType }
  export interface WatcherOpts {
    ignore?: string[]
    backend?: 'fs-events' | 'watchman' | 'inotify' | 'windows' | 'brute-force'
  }
  export function subscribe(
    dir: string,
    fn: (err: Error | null, events: FileEvent[]) => void,
    opts?: WatcherOpts,
  ): Promise<{ unsubscribe(): void }>
  export function unsubscribe(
    dir: string,
    fn: (err: Error | null, events: FileEvent[]) => void,
    opts?: WatcherOpts,
  ): Promise<void>
  export function writeSnapshot(
    dir: string,
    snapshotPath: string,
    opts?: WatcherOpts,
  ): Promise<void>
  export function getEventsSince(
    dir: string,
    snapshotPath: string,
    opts?: WatcherOpts,
  ): Promise<FileEvent[]>
}
