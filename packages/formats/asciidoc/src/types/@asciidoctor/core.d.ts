declare module '@asciidoctor/core' {
  interface Option {
    safe: string
    attributes: object
  }
  interface AsciiDoctor {
    convert(content: string, option: Option): string
  }
  export default function asciiDoctorFactory(): AsciiDoctor
}
