import { DurationObject } from 'luxon'

export interface CacheConfig {
  basePath: string
  maxDataLength: number
  defaultMaxAge: DurationObject
}

export interface GithubConfig {
  accessToken: string
}

export interface ApiConfig {
  cache: CacheConfig
  github: GithubConfig
}
