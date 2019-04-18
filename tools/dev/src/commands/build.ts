import { tsc } from '../binaries'

export const build = (argv: string[]): Promise<number> => tsc(...argv)
