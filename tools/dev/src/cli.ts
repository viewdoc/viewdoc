#!/usr/bin/env node

import commands from './commands'
import { runCLI } from './run-cli'

export const cli = (argv: string[]) => {
  runCLI(argv, commands)
}

if (require.main === module) {
  cli(process.argv.slice(2))
}
