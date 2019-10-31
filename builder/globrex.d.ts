declare module 'globrex' {
  interface Opts {
    /** Support advanced ext globbing */
    extended?: boolean
    /** Support globstar */
    globstar?: boolean
    /** be laissez faire about multiple slashes */
    strict?: boolean
    /** Parse as filepath for extra path related features */
    filepath?: boolean
    /** RegExp globs */
    flags?: string
  }

  interface GlobRexResultWithPath extends GlobRexResult {
    path: {
      /** Array of RegExp instances seperated by /. This can be usable when working with file paths or urls. */
      segments: RegExp[]
      /** JavaScript RegExp instance build for testign against paths. The regex have different path seperators depending on host OS. */
      regex: RegExp
    }
  }

  interface GlobRexResult {
    regex: RegExp
  }

  /**
   * @param glob Glob pattern to convert
   * @param opts Configuration object
   */
  function globrex(
    glob: string,
    opts: Opts & { filepath: true },
  ): GlobRexResultWithPath
  function globrex(glob: string, opts?: Opts): GlobRexResult
  export = globrex
}
