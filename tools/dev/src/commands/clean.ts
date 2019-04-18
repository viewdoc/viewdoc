import { rimraf } from '../binaries'

export const clean = (argv: string[]): Promise<number> => rimraf('lib', 'coverage', 'package-lock.json', ...argv)
