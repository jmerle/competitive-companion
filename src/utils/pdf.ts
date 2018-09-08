const pdfjsLib = require('pdfjs-dist');
const PdfjsWorker = require('../../node_modules/pdfjs-dist/build/pdf.worker.js');

export function readPdf(pdfUrl: string): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    if (!pdfjsLib.GlobalWorkerOptions.workerPort) {
      pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker();
    }

    try {
      const pdf = await pdfjsLib.getDocument(pdfUrl);

      const lines: string[] = [];

      for (let i = 0; i < pdf.pdfInfo.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();

        textContent.items
          .map((item: any) => item.str)
          .map((line: string) => line.replace(/([^ ])  ([^ ])/g, '$1 $2'))
          .forEach((line: string) => lines.push(line));
      }

      resolve(lines);
    } catch (err) {
      reject(err);
    }
  });
}
