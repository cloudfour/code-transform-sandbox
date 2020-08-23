declare module 'linaria/rollup.js' {
  import { Plugin } from 'rollup'
  interface Options {
    sourceMap?: boolean
  }
  const plugin: (opts: Options) => Plugin
  export default plugin
}

declare module 'rollup-plugin-css-only' {
  import { Plugin } from 'rollup'
  interface Options {
    output: string
  }
  const plugin: (opts: Options) => Plugin
  export default plugin
}

declare module 'mri' {
  type Args = string[]
  interface Opts {
    alias?: Record<string, string | string[]>
    boolean?: string | string[]
    string?: string | string[]
    default?: Record<string, string | number | boolean>
  }
  function mri(
    args?: Args,
    opts?: Opts,
  ): { _: string[]; [key: string]: string | number | boolean }
  export default mri
}

declare module 'terser/main' {
  export * from 'terser'
}

declare module 'mitt' {
  export type EventType = string | symbol

  type WildcardHandler<Events> = (
    type: keyof Events,
    data: Events[keyof Events],
  ) => void

  export interface Emitter<Events extends EventMap> {
    /** A Map of event names to registered handler functions */
    all: { [K in keyof Events]: (data?: Events[K]) => void }

    /** Register an event handler for the given type */
    on<T extends keyof Events>(
      /** Type of event to listen for, or "*" for all events */
      type: T,
      /** Function to call in response to given event */
      handler: (data: Events[T]) => void,
    ): void
    /** Register an event handler for the given type */
    on(
      /** Type of event to listen for, or "*" for all events */
      type: '*',
      /** Function to call in response to given event */
      handler: WildcardHandler<Events>,
    ): void

    /** Remove an event handler for the given type */
    off<T extends keyof Events>(
      /** Type of event to unregister handler from, or "*" */
      type: T,
      /** Handler function to remove */
      handler: (data: Events[T]) => void,
    ): void
    /** Remove an event handler for the given type */
    off(
      /** Type of event to unregister handler from, or "*" */
      type: '*',
      /** Handler function to remove */
      handler: WildcardHandler<Events>,
    ): void

    /** Invoke all handlers for the given type. If present, "*" handlers are invoked after type-matched handlers */
    emit<T extends keyof Events>(
      /** The event type to invoke */
      type: T,
      /** Any value passed to each handler */
      event: Events[T],
    ): void
  }
  export interface EventMap {
    [eventName: EventType]: unknown
  }
  function mitt<Events extends EventMap>(): Emitter<Events>
  export default mitt
}

declare const Comlink: typeof import('comlink')
