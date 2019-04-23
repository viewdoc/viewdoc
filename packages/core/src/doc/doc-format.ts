export interface DocFormat {
  readonly id: string
  readonly extensions: string[]
  getHtmlContent (rawContent: string): Promise<string>
}
