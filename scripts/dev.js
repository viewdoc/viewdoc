const { cli } = require('../tools/dev/lib/cli')

// A shortcut for tools/dev/lib/cli

if (require.main === module) {
  cli(process.argv.slice(2))
}
