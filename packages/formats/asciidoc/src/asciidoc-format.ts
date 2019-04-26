import asciiDoctorFactory from '@asciidoctor/core'
import { FormatInterface } from '@viewdoc/core/lib/doc'

const asciiDoctor = asciiDoctorFactory()

export class AsciidocFormat implements FormatInterface {
  readonly id: string = 'asciidoc'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.asc', '.adoc', '.asciidoc']

  async getHtmlContent (asciidocContent: string): Promise<string> {
    return asciiDoctor.convert(asciidocContent, { safe: 'secure', attributes: { showtitle: true } })
  }
}
