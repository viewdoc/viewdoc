import { CacheInterface } from '@viewdoc/core/lib/cache'
import crypto from 'crypto'
import { ensureDirSync, readdir, readFile, readJSON, remove, removeSync, writeFileSync } from 'fs-extra'
import LRUCache from 'lru-cache'
import { DateTime, Duration, DurationObject } from 'luxon'
import path from 'path'
import walk from 'walk'

export interface FileBasedCacheOptions {
  basePath: string
  maxDataLength: number
  defaultMaxAge: DurationObject
  getDirName (expiredAt: DateTime): string
  cleanDirEvery: DurationObject
}

interface CacheInfo {
  dirName: string
  fileName: string
  dataLength: number
}

interface CacheItem<T> {
  key: string
  value: T
  dirName: string
  expiredAt: string
}

const nowUTC = () => DateTime.local().toUTC()

export class FileBasedCache implements CacheInterface {
  private readonly options: FileBasedCacheOptions
  private readonly infoCache: LRUCache<string, CacheInfo>

  constructor (fileBasedCacheOptions: FileBasedCacheOptions) {
    const { basePath, maxDataLength } = fileBasedCacheOptions
    this.options = fileBasedCacheOptions
    this.infoCache = new LRUCache({
      max: maxDataLength,
      length (info) {
        return info.dataLength
      },
      dispose (key, info) {
        try {
          removeSync(path.join(basePath, info.dirName, info.fileName))
        } catch (err) {
          console.log('Remove cache failed', info, err)
        }
      },
    })
  }

  async start (): Promise<void> {
    await this.cleanCache()
    await this.reloadCache()
  }

  async getValue<T> (key: string, computeValue: () => Promise<T>, maxAge?: DurationObject): Promise<T> {
    const { basePath, defaultMaxAge, getDirName } = this.options
    const info: CacheInfo | undefined = this.infoCache.get(key)
    if (info) {
      try {
        const cachedItem: CacheItem<T> = await readJSON(path.join(basePath, info.dirName, info.fileName))
        if (cachedItem && cachedItem.key === key) {
          return cachedItem.value
        }
      } catch (err) {
        console.log('Read cache failed', info, err)
        this.infoCache.del(key)
      }
    }
    const value = await computeValue()
    if (!this.infoCache.has(key)) {
      try {
        const timeToLive = Duration.fromObject(maxAge || defaultMaxAge)
        const expiredAt = nowUTC().plus(timeToLive)
        const dirName = getDirName(expiredAt)
        const fileName = `${crypto.randomBytes(16).toString('hex')}.json`
        const itemToCache: CacheItem<T> = { key, value, dirName, expiredAt: expiredAt.toISO() }
        const data = JSON.stringify(itemToCache)
        ensureDirSync(path.join(basePath, dirName))
        writeFileSync(path.join(basePath, dirName, fileName), data)
        this.infoCache.set(key, { dirName, fileName, dataLength: data.length }, timeToLive.as('milliseconds'))
      } catch (err) {
        console.log('Write cache failed', err)
      }
    }
    return value
  }

  reloadCache (): Promise<void> {
    const { basePath } = this.options
    const now = nowUTC()
    const nowISO = now.toISO()
    return new Promise((resolve, reject) => {
      let count = 0
      const walker = walk.walk(basePath)
      walker.on('file', async (dirPath, fileStats, next) => {
        const data: string = await readFile(path.join(dirPath, fileStats.name), 'utf-8')
        const cachedItem: CacheItem<any> = JSON.parse(data)
        if (cachedItem.expiredAt && cachedItem.expiredAt > nowISO) {
          const { dirName } = cachedItem
          const timeToLive = DateTime.fromISO(cachedItem.expiredAt).diff(now)
          this.infoCache.set(
            cachedItem.key,
            { dirName, fileName: fileStats.name, dataLength: data.length },
            timeToLive.as('milliseconds'),
          )
          count += 1
        }
        next()
      })
      walker.on('errors', reject)
      walker.on('end', () => {
        console.log(`Reload cache: ${count}`)
        resolve()
      })
    })
  }

  async cleanCache (): Promise<void> {
    const { basePath, getDirName, cleanDirEvery } = this.options
    const cleanDuration = Duration.fromObject(cleanDirEvery)
    try {
      const currentDirName = getDirName(nowUTC().minus(cleanDuration))
      const dirNames = await readdir(basePath)
      const dirNamesToRemove = dirNames.filter((dirName) => dirName < currentDirName)
      for (const dirNameToRemove of dirNamesToRemove) {
        await remove(path.join(basePath, dirNameToRemove))
      }
      console.log(`Clean cache: ${dirNamesToRemove.length}`)
    } catch (err) {
      console.log('Clean cache failed', err)
    }
    setTimeout(async () => {
      await this.cleanCache()
    }, cleanDuration.as('milliseconds'))
  }
}
