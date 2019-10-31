declare module 'wrap-ansi' {
  const wrapAnsi: (
    string: string,
    columns: number,
    options?: { hard?: boolean; wordWrap?: boolean; trim?: boolean },
  ) => string
  export = wrapAnsi
}
