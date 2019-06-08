import { SourceInterface } from './source-interface'

export class SourceManager {
  constructor (private readonly sources: SourceInterface[]) {}

  findById (sourceId: string): SourceInterface | undefined {
    return this.sources.find((source) => source.id === sourceId)
  }

  findBySubdomain (subdomain: string): SourceInterface | undefined {
    if (!subdomain) {
      return this.sources[0]
    }
    return this.sources.find((source) => source.subdomains.includes(subdomain))
  }
}
