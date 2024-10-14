import JSZip from 'jszip';

// JSZip doesn't seem to work properly in Firefox addons, this is a workaround to the issue
// See https://github.com/Stuk/jszip/issues/759 for more information
function processBlob(blob: Blob): Promise<ArrayBuffer | string> {
  return new Promise(resolve => {
    const fileReader = new FileReader();

    fileReader.onload = event => {
      resolve(event.target.result);
    };

    fileReader.readAsBinaryString(blob);
  });
}

export async function fetchZip(url: string, extensions: string[]): Promise<Record<string, string>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ZIP file from ${url}`);
  }

  const blob = await response.blob();
  const processedBlob = await processBlob(blob);

  const zip = new JSZip();
  const content = await zip.loadAsync(processedBlob);

  const files: Record<string, string> = {};

  for (const fileName in content.files) {
    if (!Object.prototype.hasOwnProperty.call(content.files, fileName)) {
      continue;
    }

    if (!extensions.some(ext => fileName.endsWith(ext))) {
      continue;
    }

    files[fileName] = await content.files[fileName].async('string');
  }

  return files;
}
