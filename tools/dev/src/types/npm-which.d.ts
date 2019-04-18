declare module 'npm-which' {
  interface Which {
    sync(cmd: string): string
  }
  export default function whichFactory(cwd: string): Which
}
