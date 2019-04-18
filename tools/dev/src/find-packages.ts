import fs from 'fs'
import path from 'path'

export const isPackage = (dirPath: string): boolean => {
  return fs.existsSync(path.join(dirPath, 'package.json'))
}

export const findPackages = (dirPath: string, predicate?: (pkgPath: string) => boolean): string[] => {
  const packages: string[] = []
  fs.readdirSync(dirPath).forEach((childName) => {
    if (childName === 'node_modules') {
      return
    }
    const childPath = path.join(dirPath, childName)
    if (!fs.statSync(childPath).isDirectory()) {
      return
    }
    if (isPackage(childPath)) {
      if (!predicate || predicate(childPath)) {
        packages.push(childPath)
      }
      return
    }
    packages.push(...findPackages(childPath, predicate))
  })
  return packages
}
