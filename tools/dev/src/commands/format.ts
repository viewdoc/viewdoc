import { prettier } from '../binaries'

export const format = (argv: string[]): Promise<number> => prettier('--write', ...argv, 'src/**/*.ts', '**/*.js')
