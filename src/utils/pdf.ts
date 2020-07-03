const pdfjsLib = require('pdfjs-dist');
const PdfjsWorker = require('../../node_modules/pdfjs-dist/build/pdf.worker.js');

export async function readPdf(pdfUrl: string): Promise<string[]> {
  if (!pdfjsLib.GlobalWorkerOptions.workerPort) {
    pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker();
  }

  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;

  const lines: string[] = [];

  for (let i = 0; i < pdf._pdfInfo.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const textContent = await page.getTextContent();

    textContent.items
      .map((item: any) => item.str)
      .map((line: string) => line.replace(/([^ ]) {2}([^ ])/g, '$1 $2'))
      .forEach((line: string) => lines.push(line));
  }

  return lines;
}
