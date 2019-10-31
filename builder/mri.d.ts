declare module 'mri' {
  type Value = string | boolean | number
  interface Options {
    /** An object of keys whose values are Strings or Array<String> of aliases. These will be added to the parsed output with matching values. */
    alias?: Record<string, string | string[]>
    /** A single key (or array of keys) that should be parsed as Booleans. */
    boolean?: string | string[]
    /** An key:value object of defaults. If a default is provided for a key, its type (typeof) will be used to cast parsed arguments. */
    default?: Record<string, Value>
    /** A single key (or array of keys) that should be parsed as Strings. */
    string?: string | string[]
    /** Callback that is run when a parsed flag has not been defined as a known key or alias. Its only parameter is the unknown flag itself; eg --foobar or -f. */
    unknown?: (flag: string) => void
  }
  interface Result {
    /** Extra arguments */
    _: string[]
    [key: string]: Value[]
  }
  function mri(args: string[], options?: Options): Result
  export = mri
}
