interface RequestIdleCallback {
  (callback: () => void): number
}

interface CancelIdleCallback {
  (handle: number): void
}

declare global {
  interface Window {
    requestIdleCallback?: RequestIdleCallback
    cancelIdleCallback?: CancelIdleCallback
  }
}

export const cancelIdleCallback: CancelIdleCallback =
  self.cancelIdleCallback || self.clearTimeout

export const requestIdleCallback: RequestIdleCallback =
  self.requestIdleCallback ||
  // "polyfill" just runs it in the next tick
  ((cb) => self.setTimeout(cb, 0))
