import { DurationObject } from 'luxon'

export interface CacheInterface {
  start (): Promise<void>
  getValue<T> (key: string, computeValue: () => Promise<T>, maxAge?: DurationObject): Promise<T>
}
