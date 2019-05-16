export interface HtmlContent {
  toc: string
  output: string
}

export interface FormatInterface {
  readonly id: string
  readonly extensions: string[]
  getHtmlContent (rawContent: string): Promise<HtmlContent>
}
