export interface HtmlContent {
  output: string
}

export interface FormatInterface {
  readonly id: string
  readonly extensions: string[]
  getHtmlContent (rawContent: string): Promise<HtmlContent>
}
