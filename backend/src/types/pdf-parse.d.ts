declare module 'pdf-parse' {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }
  
  function PDFParse(buffer: Buffer, options?: any): Promise<PDFParseResult>;
  
  export = PDFParse;
}