import { lerna } from '../binaries'

export const add = (argv: string[]): Promise<number> => lerna('add', ...argv, '--no-bootstrap')
