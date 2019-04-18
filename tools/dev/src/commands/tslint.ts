import { tslint as runTSLint } from '../binaries'

export const tslint = (argv: string[]): Promise<number> => {
  const argvToRun = []
  if (!argv.includes('--project')) {
    argvToRun.push('--project', 'tsconfig.json')
  }
  argvToRun.push('--fix', ...argv)
  return runTSLint(...argvToRun)
}
