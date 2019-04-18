import chokidar from 'chokidar'
import fs from 'fs'
import path from 'path'
import { createBinaryWithOptions } from '../binaries'
import { findPackages } from '../find-packages'

const npm = createBinaryWithOptions('npm')

const shouldWatch = (pkgPath: string, scriptName: string): boolean => {
  if (!fs.existsSync(path.join(pkgPath, 'src'))) {
    return false
  }
  const pkgJson = require(path.join(pkgPath, 'package.json'))
  return pkgJson.scripts && pkgJson.scripts[scriptName]
}

export const watch = async (argv: string[]): Promise<number> => {
  const scriptName = argv[0]
  const rootPath = process.cwd()
  const packages = findPackages(rootPath, (pkgPath) => shouldWatch(pkgPath, scriptName))
  console.log(`Watching the following packages to run '${scriptName}' script:`)
  console.log()
  packages.forEach((pkgPath) => {
    console.log(`- ${path.relative(rootPath, pkgPath)}`)
  })
  console.log()
  const watcher = chokidar.watch(packages.map((pkgPath) => path.join(pkgPath, 'src')))
  watcher.on('change', async (filePath) => {
    const pkgPath = filePath.split('src')[0]
    await npm(['run', scriptName], { cwd: pkgPath })
    console.log('Done')
  })
  watcher.on('error', console.error)
  return 0
}
