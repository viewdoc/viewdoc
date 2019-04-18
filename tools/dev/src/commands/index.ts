import { add } from './add'
import { build } from './build'
import { checkdeps } from './checkdeps'
import { clean } from './clean'
import { eslint } from './eslint'
import { format } from './format'
import { run } from './run'
import { tslint } from './tslint'
import { watch } from './watch'

const commands: Record<string, (argv: string[]) => Promise<number>> = {
  add,
  build,
  clean,
  eslint,
  format,
  run,
  tslint,
  watch,
  checkdeps,
}

export default commands
