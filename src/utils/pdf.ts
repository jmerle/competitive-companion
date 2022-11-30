const pdfjsLib = require('pdfjs-dist/build/pdf.min.js');

// eslint-disable-next-line @typescript-eslint/naming-convention
const PdfjsWorker = require('pdfjs-dist/build/pdf.worker.min.js');

export async function readPdf(pdfUrl: string): Promise<string[]> {
  if (!pdfjsLib.GlobalWorkerOptions.workerPort) {
    pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker.default();
  }

  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;

  const lines: string[] = [];

  for (let i = 0; i < pdf._pdfInfo.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const textContent = await page.getTextContent();

    let currentLine = '';
    let lastY = -1;

    for (const item of textContent.items) {
      const y = item.transform[5];
      if (y !== lastY) {
        if (lastY !== -1) {
          lines.push(currentLine);
        }

        currentLine = '';
      }

      currentLine += item.str;
      lastY = y;
    }

    if (lastY !== -1) {
      lines.push(currentLine);
    }
  }

  return lines.map(line => line.replace(/([^ ]) {2}([^ ])/g, '$1 $2'));
}
