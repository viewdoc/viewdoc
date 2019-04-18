import { lerna } from '../binaries'

export const run = (argv: string[]): Promise<number> => lerna('run', ...argv)
