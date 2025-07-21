import JSZip from 'jszip';
import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CSESProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://cses.fi/*/task/*', 'https://www.cses.fi/*/task/*'];
  }

  // Custom function to fetch and process ZIP files from CSES
  private async fetchCSESTestCases(url: string): Promise<Record<string, string>> {
    // Step 1: Fetch the download page to get the CSRF token
    const downloadPageResponse = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });

    if (!downloadPageResponse.ok) {
      throw new Error(`Failed to fetch download page. Status: ${downloadPageResponse.status}`);
    }

    const downloadPageHtml = await downloadPageResponse.text();
    const downloadPageElement = htmlToElement(downloadPageHtml);
    const csrfInput = downloadPageElement.querySelector('input[name="csrf_token"]');

    if (!csrfInput) {
      throw new Error('CSRF token not found in download page. User may not be logged in.');
    }

    const csrfToken = csrfInput.getAttribute('value') || '';

    // Step 2: Send POST request with CSRF token to download ZIP
    const formData = new URLSearchParams();
    formData.append('csrf_token', csrfToken);
    formData.append('download', 'true');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Authentication failed. Status: ${response.status}. Please ensure you are logged in to CSES.`);
      } else if (response.status === 302 || response.status === 307) {
        throw new Error(`Redirect response (${response.status}). This might indicate you need to log in to CSES.`);
      } else {
        throw new Error(`Failed to download ZIP file from ${url}. Status: ${response.status}`);
      }
    }

    // Process response
    const blob = await response.blob();

    // Check if the response is HTML instead of ZIP
    if (blob.type.includes('text/html') || blob.size < 100) {
      const textContent = await blob.text();
      if (textContent.includes('login') || textContent.includes('sign in')) {
        throw new Error('Received login page instead of ZIP file. User needs to be logged in to CSES.');
      } else {
        throw new Error(`Received unexpected content type: ${blob.type} (size: ${blob.size})`);
      }
    }

    // Convert blob to binary string (Firefox workaround)
    const binaryString = await new Promise<string>((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => resolve(event.target.result as string);
      fileReader.readAsBinaryString(blob);
    });

    // Load and process ZIP content
    const zip = new JSZip();
    const content = await zip.loadAsync(binaryString);

    const files: Record<string, string> = {};
    for (const fileName of Object.keys(content.files)) {
      if (!Object.prototype.hasOwnProperty.call(content.files, fileName)) continue;
      if (!fileName.endsWith('.in') && !fileName.endsWith('.out')) continue;

      try {
        const fileContent = await content.files[fileName].async('string');
        files[fileName] = fileContent;
      } catch (error) {
        // Skip files that can't be extracted
        continue;
      }
    }

    return files;
  } public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CSES').setUrl(url);

    task.setName(elem.querySelector('.title-block > h1').textContent);
    task.setCategory(elem.querySelector('.title-block > h3 > a').textContent);

    const limitsStr = elem.querySelector('.task-constraints').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+) s/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1], 10));

    // Extract problem ID from URL
    const problemIdMatch = url.match(/\/task\/(\d+)/);
    if (problemIdMatch) {
      const problemId = problemIdMatch[1];
      const zipUrl = `https://cses.fi/problemset/tests/${problemId}/`;

      try {
        // Try to fetch test cases from ZIP file
        const files = await this.fetchCSESTestCases(zipUrl);

        // Group and sort input/output files
        const inputFiles = Object.keys(files).filter(name => name.endsWith('.in')).sort();
        const outputFiles = Object.keys(files).filter(name => name.endsWith('.out')).sort();

        // Add test cases from ZIP files
        const testCount = Math.min(inputFiles.length, outputFiles.length);
        for (let i = 0; i < testCount; i++) {
          const inputContent = files[inputFiles[i]].trim();
          const outputContent = files[outputFiles[i]].trim();
          task.addTest(inputContent, outputContent);
        }
      } catch (error) {
        // Fall back to parsing from HTML if ZIP download fails
        this.parseTestsFromHTML(elem, task);
      }
    } else {
      // If we can't extract problem ID, fall back to HTML parsing
      this.parseTestsFromHTML(elem, task);
    }

    return task.build();
  }

  // Helper method to parse test cases from HTML
  private parseTestsFromHTML(elem: Element, task: TaskBuilder): void {
    const find = function (nodes: Element[]): Element[] {
      let count = 0;
      const result: Element[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id.startsWith('example')) {
          count = 2;
          continue;
        }
        if (count > 0) {
          result.push(nodes[i]);
          count--;
        }
      }
      return result;
    };

    const codeBlocks = find([...elem.querySelectorAll('[id^=example], .content pre')]);
    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      const input = codeBlocks[i].textContent;
      const output = codeBlocks[i + 1].textContent;
      task.addTest(input, output);
    }
  }
}
