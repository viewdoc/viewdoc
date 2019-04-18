import { eslint as runESLint } from '../binaries'

export const eslint = (argv: string[]): Promise<number> => {
  return runESLint('--config', 'eslint.json', '--ignore-pattern', '/lib/', '--fix', ...argv, '.')
}
