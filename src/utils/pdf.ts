// @ts-expect-error There are no types for this import
const pdfjsLibPromise = import('pdfjs-dist/build/pdf.min.mjs');
// @ts-expect-error There are no types for this import
const pdfjsWorkerPromise = import('pdfjs-dist/build/pdf.worker.min.mjs');

export async function readPdf(pdfUrl: string): Promise<string[]> {
  const pdfjsLib = await pdfjsLibPromise;
  const pdfjsWorker = await pdfjsWorkerPromise;

  if (!pdfjsLib.GlobalWorkerOptions.workerPort) {
    pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(URL.createObjectURL(new Blob([pdfjsWorker.default])));
  }

  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;

  const lines: string[] = [];
  const charWidth = 5;

  const leftMarginCounts: Record<string, number> = {};
  let leftMargin: number = -1;

  for (let i = 0; i < pdf._pdfInfo.numPages; i++) {
    const page = await pdf.getPage(i + 1);

    let textContent;
    try {
      textContent = await page.getTextContent();
    } catch (err) {
      if ((err as any)?.message === 'Permission denied to access property "autoAllocateChunkSize"') {
        console.trace(err);
        console.warn(
          'Competitive Companion cannot read PDFs in Firefox due to Firefox bug 1757836: https://bugzilla.mozilla.org/show_bug.cgi?id=1757836',
        );
        return [];
      }

      throw err;
    }

    let currentLine = '';
    let lastX = -1;
    let lastY = -1;

    for (const item of textContent.items) {
      const x = item.transform[4];
      const y = item.transform[5];

      if (y !== lastY) {
        if (lastY !== -1) {
          lines.push(currentLine);
        }

        currentLine = '';

        const currentLeftMargin = x.toFixed(2);
        leftMarginCounts[currentLeftMargin] = (leftMarginCounts[currentLeftMargin] || 0) + 1;

        if (Number(currentLeftMargin) !== leftMargin) {
          for (const margin of Object.keys(leftMarginCounts)) {
            if (leftMargin === -1 || leftMarginCounts[margin] > leftMarginCounts[leftMargin]) {
              leftMargin = Number(margin);
            }
          }
        }

        lastX = leftMargin;
      }

      const leadingSpaces = Math.round((x - lastX) / charWidth);
      if (leadingSpaces > 0) {
        currentLine += ' '.repeat(leadingSpaces);
      }

      currentLine += item.str;
      lastX = x + item.str.length * charWidth;
      lastY = y;
    }

    if (lastY !== -1) {
      lines.push(currentLine);
    }
  }

  return lines.map(line => line.replace(/([^ ]) {2}([^ ])/g, '$1 $2'));
}
