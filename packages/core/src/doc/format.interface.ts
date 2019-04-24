export interface FormatInterface {
  readonly id: string
  readonly extensions: string[]
  getHtmlContent (rawContent: string): Promise<string>
}
