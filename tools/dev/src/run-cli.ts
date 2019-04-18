export const runCLI = (argv: string[], commands: Record<string, (argv: string[]) => Promise<number>>) => {
  const [commandName, ...commandArgv] = argv
  const command = commands[commandName]
  if (!command) {
    throw new Error(`Command not found: ${commandName}`)
  }
  command(commandArgv)
    .then((exitCode) => {
      if (exitCode) {
        process.exit(exitCode)
      }
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
