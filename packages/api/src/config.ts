import { DurationObject } from 'luxon'

export interface CacheConfig {
  basePath: string
  maxDataLength: number
  defaultMaxAge: DurationObject
}

export interface GithubConfig {
  accessToken: string
}

export interface GitlabConfig {
  accessToken: string
}

export interface MarkupServiceConfig {
  baseUrl: string
}

export interface ApiConfig {
  cache: CacheConfig
  github: GithubConfig
  gitlab: GitlabConfig
  markupService: MarkupServiceConfig
}
