import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { decodeHtml, htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import CodeforcesCalendarGenerator from '../../utils/calendar';
import { Parser } from '../Parser';

// Special class for calendar integration that doesn't send data to backend
class CalendarIntegration implements Sendable {
  constructor(public name: string) {}
  
  public async send(): Promise<void> {
    // Do nothing - calendar integration shouldn't send data to backend
    return Promise.resolve();
  }
}

export class CodeforcesProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    const patterns: string[] = [];

    [
      'https://codeforces.com/contest/*',
      'https://codeforces.com/contest/*/problem/*',
      'https://codeforces.com/contests/*',
      'https://codeforces.com/problemset/problem/*/*',
      'https://codeforces.com/gym/*',
      'https://codeforces.com/gym/*/problem/*',
      'https://codeforces.com/group/*/contest/*/problem/*',
      'https://codeforces.com/problemsets/acmsguru/problem/*/*',
      'https://codeforces.com/edu/course/*/lesson/*/*/practice/contest/*/problem/*',
      'https://codeforces.com/problemset/gymProblem/*',
    ].forEach(pattern => {
      patterns.push(pattern);
      patterns.push(pattern.replace('https://codeforces.com', 'https://*.codeforces.com'));
    });

    const mlPatterns = patterns.map(pattern => pattern.replace('.com', '.ml'));
    const esPatterns = patterns.map(pattern => pattern.replace('es.com', '.es'));
    const netPatterns = patterns.map(pattern => pattern.replace('.com', '.net'));

    const httpsPatterns = [...patterns, ...mlPatterns, ...esPatterns, ...netPatterns];
    const httpPatterns = httpsPatterns.map(pattern => pattern.replace('https://', 'http://'));

    return [...httpsPatterns, ...httpPatterns];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const task = new TaskBuilder('Codeforces').setUrl(url);

    // Check if it's a contest overview page (contest/xxxx without /problem/)
    const contestOverviewMatch = url.match(/\/contest\/\d+\/?(\?.*)?$/);
    if (contestOverviewMatch) {
      return await this.parseContestOverview(html, url, task);
    }

    // Check if it's the general upcoming contests page (/contests/ URL without specific contest ID)
    const upcomingContestsMatch = url.match(/\/contests\/?(\?.*)?$/);
    if (upcomingContestsMatch) {
      return await this.parseUpcomingContests(html, url);
    }

    // Check if it's a specific upcoming contest page (/contests/XXXX)
    const specificContestMatch = url.match(/\/contests\/(\d+)\/?(\?.*)?$/);
    if (specificContestMatch) {
      return await this.parseSpecificUpcomingContest(html, url, specificContestMatch[1]);
    }

    if (url.includes('/problemsets/acmsguru')) {
      const elem = htmlToElement(html);
      const table = elem.querySelector('.problemindexholder > .ttypography > table');

      if (table) {
        this.parseAcmSguRuProblemInsideTable(html, task);
      } else {
        this.parseAcmSguRuProblemNotInsideTable(html, task);
      }
    } else if (html.startsWith('%PDF') || htmlToElement(html).querySelector('embed[type="application/pdf"]') !== null) {
      await this.parsePdfProblem(url, task);
    } else {
      this.parseMainProblem(html, url, task);
    }

    return task.build();
  }

  private parseMainProblem(html: string, url: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problem-statement > .header > .title').textContent.trim());

    if (url.includes('/edu/')) {
      const breadcrumbs = Array.from(elem.querySelectorAll('.eduBreadcrumb > a')).map(el => el.textContent.trim());
      breadcrumbs.pop();
      task.setCategory(breadcrumbs.join(' - '));
    } else {
      const contestType = url.includes('/gym/') ? 'gym' : 'contest';
      const titleElem = elem.querySelector(`.rtable > tbody > tr > th > a[href*=${contestType}]`);

      if (titleElem !== null) {
        task.setCategory(titleElem.textContent.trim());
      }
    }

    const interactiveKeywords = ['Interaction', 'Протокол взаимодействия'];
    const isInteractive = Array.from(elem.querySelectorAll('.section-title')).some(
      el => interactiveKeywords.indexOf(el.textContent) > -1,
    );

    task.setInteractive(isInteractive);

    const timeLimitNode = this.getLastTextNode(elem, '.problem-statement > .header > .time-limit');
    const timeLimitStr = timeLimitNode.textContent.split(' ')[0];
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitNode = this.getLastTextNode(elem, '.problem-statement > .header > .memory-limit');
    const memoryLimitStr = memoryLimitNode.textContent.split(' ')[0];
    task.setMemoryLimit(parseInt(memoryLimitStr, 10));

    const inputFile = this.getLastTextNode(elem, '.problem-statement > .header > .input-file').textContent;
    if (inputFile !== 'stdin' && inputFile !== 'standard input' && inputFile !== 'стандартный ввод') {
      task.setInput({
        fileName: inputFile,
        type: 'file',
      });
    }

    const outputFile = this.getLastTextNode(elem, '.problem-statement > .header > .output-file').textContent;
    if (outputFile !== 'stdout' && outputFile !== 'standard output' && outputFile !== 'стандартный вывод') {
      task.setOutput({
        fileName: outputFile,
        type: 'file',
      });
    }

    const inputs = elem.querySelectorAll('.input pre');
    const outputs = elem.querySelectorAll('.output pre');

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(this.parseMainTestBlock(inputs[i]), this.parseMainTestBlock(outputs[i]));
    }
  }

  private parseMainTestBlock(block: Element): string {
    const lines = Array.from(block.querySelectorAll('.test-example-line')).filter(
      el => el.querySelector('.test-example-line, br') === null,
    );

    if (lines.length === 0) {
      return decodeHtml(block.innerHTML);
    }

    return Array.from(lines).map(el => decodeHtml(el.innerHTML)).join('\n');
  }

  private parseAcmSguRuProblemInsideTable(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problemindexholder h3').textContent.trim());
    task.setCategory('acm.sgu.ru archive');

    task.setTimeLimit(parseFloat(/time limit per test: ([0-9.]+)\s+sec/.exec(html)[1]) * 1000);
    task.setMemoryLimit(parseInt(/memory\s+limit per test:\s+(\d+)\s+KB/.exec(html)[1], 10) / 1000);

    const blocks = elem.querySelectorAll('font > pre');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }
  }

  private parseAcmSguRuProblemNotInsideTable(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problemindexholder h4').textContent.trim());
    task.setCategory('acm.sgu.ru archive');

    task.setTimeLimit(parseFloat(/Time\s+limit per test: ([0-9.]+)\s+sec/i.exec(html)[1]) * 1000);
    task.setMemoryLimit(parseInt(/Memory\s+limit(?: per test)*: (\d+)\s+(?:kilobytes|KB)/i.exec(html)[1], 10) / 1000);

    elem.querySelectorAll('table').forEach(table => {
      const blocks = table.querySelectorAll('pre');
      if (blocks.length === 4) {
        task.addTest(blocks[2].textContent, blocks[3].textContent);
      }
    });
  }

  private async parsePdfProblem(url: string, task: TaskBuilder): Promise<void> {
    const parsedUrl = new URL(url);
    const contest = await request(parsedUrl.origin + parsedUrl.pathname.split('/problem')[0]);

    const elem = htmlToElement(contest);

    const contestName = elem
      .querySelector('#sidebar > div > .rtable')
      .querySelector('a')
      .textContent.replace('\n', ' ')
      .trim();

    task.setCategory(contestName);

    const letter = url[url.length - 1].toUpperCase();
    const rowElem = Array.from(elem.querySelectorAll('table.problems > tbody > tr')).find(el => {
      const link = el.querySelector('.id > a');
      return link !== null && link.textContent.trim() === letter;
    });

    this.parseContestRow(rowElem, task);
  }

  private async parseContestOverview(html: string, url: string, task: TaskBuilder): Promise<Sendable> {
    const elem = htmlToElement(html);

    const contestName = elem
      .querySelector('#sidebar > div > .rtable')
      ?.querySelector('a')
      ?.textContent?.replace('\n', ' ')
      ?.trim();

    // Use the same selector as CodeforcesContestParser
    const linkSelector = '.problems > tbody > tr > td:first-child > a, ._ProblemsPage_problems > table > tbody > tr > td:first-child > a';
    const problemLinks = Array.from(elem.querySelectorAll(linkSelector));
    
    if (problemLinks.length === 0) {
      // If no problems found, return a single empty task
      return task.setName('Contest Overview').setCategory(contestName || 'Contest').build();
    }

    const tasks: Task[] = [];
    
    for (const link of problemLinks) {
      const href = (link as HTMLAnchorElement).href;
      const row = link.closest('tr');
      
      try {
        // Fetch problem details for complete parsing
        const problemHtml = await request(href);
        
        // Parse the complete problem content using existing method
        const problemTask = new TaskBuilder('Codeforces').setUrl(href);
        this.parseMainProblem(problemHtml, href, problemTask);
        
        // Set contest category information
        if (contestName) {
          problemTask.setCategory(contestName);
        }
        
        tasks.push(problemTask.build());
        
      } catch (error) {
        // Fallback to basic information parsing if fetch fails
        const problemTask = new TaskBuilder('Codeforces').setUrl(href);
        if (contestName) {
          problemTask.setCategory(contestName);
        }
        this.parseContestRow(row, problemTask);
        tasks.push(problemTask.build());
      }
    }

    return new Contest(tasks);
  }

  private async parseUpcomingContests(html: string, url: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    // Extract contests from the page
    const contests = this.extractContestsFromPage(elem);
    
    // Show calendar integration dialog in the browser
    this.showCalendarDialog(contests, url);

    // Return a non-sending calendar object that doesn't trigger any backend requests
    return new CalendarIntegration('Codeforces Contests Calendar Integration');
  }

  private extractContestsFromPage(elem: Element): Array<{id: string, name: string, startTime?: string, endTime?: string}> {
    const contests: Array<{id: string, name: string, startTime?: string, endTime?: string}> = [];
    
    // Look for contest tables - Codeforces has both upcoming and past contests
    const tables = elem.querySelectorAll('table');
    
    for (const table of Array.from(tables)) {
      const rows = table.querySelectorAll('tbody tr');
      
      Array.from(rows).forEach((row) => {
        const cells = row.querySelectorAll('td');
        
        if (cells.length >= 4) { // Contest table should have at least 4 columns
          // Column structure: [Contest name, Writers, Start time, Duration, Status, Registration]
          const firstCell = cells[0];
          const contestLink = firstCell.querySelector('a[href*="/contest/"]') as HTMLAnchorElement;
          
          if (contestLink) {
            const href = contestLink.getAttribute('href') || '';
            const contestIdMatch = href.match(/\/contest(?:s)?\/(\d+)/);
            if (contestIdMatch) {
              const id = contestIdMatch[1];
              const name = contestLink.textContent?.trim() || `Contest ${id}`;
              
              // Extract start time from the third column (index 2)
              const startTimeCell = cells[2];
              const startTime = startTimeCell?.textContent?.trim();
              
              // Extract duration from the fourth column (index 3) 
              const durationCell = cells[3];
              const duration = durationCell?.textContent?.trim();
              
              // Calculate end time if both start time and duration are available
              let endTime: string | undefined;
              if (startTime && duration && startTime !== 'TBD' && startTime !== '待定') {
                endTime = this.calculateEndTime(startTime, duration);
              }
              
              contests.push({
                id,
                name,
                startTime,
                endTime
              });
            }
          }
        }
      });
    }
    
    return contests;
  }

  public parseContestRow(elem: Element, task: TaskBuilder): void {
    const columns = elem.querySelectorAll('td');

    if (columns.length < 2) {
      return; // Not enough columns, skip this row
    }

    // URL is already set by caller, don't override it
    // task.setUrl(columns[0].querySelector('a').href);

    const letterLink = columns[0].querySelector('a');
    const nameLink = columns[1].querySelector('a');
    
    if (!letterLink || !nameLink) {
      return; // Missing required links
    }

    const letter = letterLink.textContent?.trim() || '';
    const name = nameLink.textContent?.trim() || '';

    task.setName(`${letter}. ${name}`);

    // Try to parse time and memory limits from the details
    const detailsDiv = columns[1].querySelector('div > div:not(:first-child)');
    if (detailsDiv) {
      const detailsStr = detailsDiv.textContent;
      if (detailsStr) {
        const detailsMatches = /([^/]+)\/([^\n]+)\s+([0-9.]+) s,\s+(\d+) MB/.exec(detailsStr.replace('\n', ' '));
        
        if (detailsMatches) {
          const inputFile = detailsMatches[1].trim();
          const outputFile = detailsMatches[2].trim();
          const timeLimit = Math.floor(parseFloat(detailsMatches[3].trim()) * 1000);
          const memoryLimit = parseInt(detailsMatches[4].trim());

          if (inputFile.includes('.')) {
            task.setInput({
              fileName: inputFile,
              type: 'file',
            });
          }

          if (outputFile.includes('.')) {
            task.setOutput({
              fileName: outputFile,
              type: 'file',
            });
          }

          task.setTimeLimit(timeLimit);
          task.setMemoryLimit(memoryLimit);
        }
      }
    }
  }

  private async parseSpecificUpcomingContest(html: string, url: string, contestId: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    // Extract the single contest information from the page
    const contest = this.extractSingleContestFromPage(elem, contestId);
    
    // Show calendar integration dialog in the browser
    this.showCalendarDialog([contest], url);

    // Return a non-sending calendar object that doesn't trigger any backend requests
    return new CalendarIntegration(`Codeforces Contest ${contest.name} Calendar Integration`);
  }

  private extractSingleContestFromPage(elem: Element, contestId: string): {id: string, name: string, startTime?: string, endTime?: string} {
    // First try to find contest info in table structure (similar to contests list)
    const tables = elem.querySelectorAll('table');
    
    for (const table of Array.from(tables)) {
      const rows = table.querySelectorAll('tbody tr');
      
      for (const row of Array.from(rows)) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          const firstCell = cells[0];
          const contestLink = firstCell.querySelector('a[href*="/contest/"]') as HTMLAnchorElement;
          
          if (contestLink) {
            const href = contestLink.getAttribute('href') || '';
            const contestIdMatch = href.match(/\/contest(?:s)?\/(\d+)/);
            if (contestIdMatch && contestIdMatch[1] === contestId) {
              const name = contestLink.textContent?.trim() || `Contest ${contestId}`;
              const startTimeCell = cells[2];
              const startTime = startTimeCell?.textContent?.trim();
              const durationCell = cells[3];
              const duration = durationCell?.textContent?.trim();
              
              let endTime: string | undefined;
              if (startTime && duration && startTime !== 'TBD') {
                endTime = this.calculateEndTime(startTime, duration);
              }
              
              return {
                id: contestId,
                name,
                startTime,
                endTime
              };
            }
          }
        }
      }
    }

    // Try to extract from contest header or title area
    let contestName = `Contest ${contestId}`;
    let startTime: string | undefined;
    let duration: string | undefined;

    // Look for contest title in various locations
    const titleSelectors = [
      'h1',
      'h2', 
      '.contest-title',
      '.title',
      '.datatable tr td',
      '.rtable tr td'
    ];
    
    for (const selector of titleSelectors) {
      const elements = elem.querySelectorAll(selector);
      for (const element of Array.from(elements)) {
        const text = element.textContent?.trim();
        if (text && (text.includes('Contest') || text.includes('Round') || text.includes('Div'))) {
          contestName = text;
          break;
        }
      }
      if (contestName !== `Contest ${contestId}`) break;
    }

    // Enhanced time extraction - look for time patterns in the entire page
    const pageText = elem.textContent || '';
    
    // Look for Codeforces time patterns: "Jun/08/2025 17:35"
    const timePatterns = [
      /(\w{3}\/\d{2}\/\d{4} \d{2}:\d{2})/g,
      /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})/g,
      /(\w{3} \d{1,2}, \d{4} \d{2}:\d{2})/g
    ];

    for (const pattern of timePatterns) {
      const matches = pageText.match(pattern);
      if (matches && matches.length > 0) {
        startTime = matches[0];
        break;
      }
    }

    // Look for duration pattern
    const durationPattern = /(?:Duration|Length):\s*(\d{1,2}:\d{2})/i;
    const durationMatch = pageText.match(durationPattern);
    if (durationMatch) {
      duration = durationMatch[1];
    } else {
      // Look for standalone time patterns that might be duration
      const timeMatches = pageText.match(/(\d{1,2}:\d{2})/g);
      if (timeMatches && timeMatches.length > 1) {
        // Second time pattern might be duration
        duration = timeMatches[1];
      }
    }

    // Calculate end time if both start time and duration are available
    let endTime: string | undefined;
    if (startTime && duration && startTime !== 'TBD') {
      endTime = this.calculateEndTime(startTime, duration);
    }

    return {
      id: contestId,
      name: contestName,
      startTime,
      endTime
    };
  }

  private getLastTextNode(elem: Element, selector: string): ChildNode {
    let selectedNode = elem.querySelector(selector);

    const styledNode = selectedNode.querySelector('.tex-font-style-sl, .tex-font-style-bf');
    if (styledNode !== null) {
      selectedNode = styledNode;
    }

    const textNodes = Array.from(selectedNode.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
    return textNodes[textNodes.length - 1];
  }

  private showCalendarDialog(contests: Array<{id: string, name: string, startTime?: string, endTime?: string}>, url: string): void {
    // Create a modal dialog for calendar integration
    const dialog = this.createCalendarDialog(contests, url);
    document.body.appendChild(dialog);
    
    // Show the dialog
    dialog.style.display = 'block';
  }

  private createCalendarDialog(contests: Array<{id: string, name: string, startTime?: string, endTime?: string}>, url: string): HTMLElement {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    const title = document.createElement('h2');
    title.style.cssText = `
      margin: 0 0 20px 0;
      color: #333;
      font-size: 24px;
    `;
    title.textContent = '📅 Add Contest to Calendar';

    const description = document.createElement('p');
    description.style.cssText = `
      margin: 0 0 20px 0;
      color: #666;
      line-height: 1.5;
    `;
    description.textContent = 'Select contests to add to your calendar. System will generate .ics file for importing into calendar applications.';

    dialog.appendChild(title);
    dialog.appendChild(description);

    if (contests.length === 0) {
      const noContests = document.createElement('p');
      noContests.style.cssText = 'color: #999; text-align: center; padding: 20px;';
      noContests.textContent = 'No upcoming contests found';
      dialog.appendChild(noContests);
    } else {
      // Check if URL targets a specific contest
      const contestIdMatch = url.match(/\/contests\/(\d+)/);
      
      if (contestIdMatch) {
        // Single contest
        const contestId = contestIdMatch[1];
        const targetContest = contests.find(contest => contest.id === contestId);
        
        if (targetContest) {
          this.createSingleContestSection(dialog, targetContest);
        }
      } else {
        // Multiple contests
        this.createMultipleContestsSection(dialog, contests);
      }
    }

    // Close button
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
      background: #ccc;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
      margin-right: 10px;
    `;
    closeButton.textContent = 'Cancel';
    closeButton.onclick = () => overlay.remove();

    dialog.appendChild(closeButton);
    overlay.appendChild(dialog);

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    };

    return overlay;
  }

  private createSingleContestSection(dialog: HTMLElement, contest: {id: string, name: string, startTime?: string, endTime?: string}): void {
    const contestDiv = document.createElement('div');
    contestDiv.style.cssText = `
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      margin: 10px 0;
      background: #f9f9f9;
    `;

    const contestName = document.createElement('h3');
    contestName.style.cssText = 'margin: 0 0 10px 0; color: #333;';
    contestName.textContent = contest.name;

    const contestTime = document.createElement('p');
    contestTime.style.cssText = 'margin: 0 0 15px 0; color: #666;';
    contestTime.textContent = `Start Time: ${contest.startTime || 'TBD'}`;

    const addButton = document.createElement('button');
    addButton.style.cssText = `
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
    `;
    addButton.textContent = '🔔 Add to Calendar with Reminders';
    
    addButton.onclick = () => {
      this.generateAndDownloadICS([contest]);
      dialog.closest('[style*="position: fixed"]')?.remove();
    };

    contestDiv.appendChild(contestName);
    contestDiv.appendChild(contestTime);
    contestDiv.appendChild(addButton);
    dialog.appendChild(contestDiv);
  }

  private createMultipleContestsSection(dialog: HTMLElement, contests: Array<{id: string, name: string, startTime?: string, endTime?: string}>): void {
    const selectAll = document.createElement('button');
    selectAll.style.cssText = `
      background: #2196F3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 15px;
    `;
    selectAll.textContent = '📋 Add All Contests to Calendar';
    selectAll.onclick = () => {
      this.generateAndDownloadICS(contests);
      dialog.closest('[style*="position: fixed"]')?.remove();
    };

    dialog.appendChild(selectAll);

    contests.forEach(contest => {
      const contestDiv = document.createElement('div');
      contestDiv.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 15px;
        margin: 10px 0;
        background: #f9f9f9;
      `;

      const contestName = document.createElement('h4');
      contestName.style.cssText = 'margin: 0 0 5px 0; color: #333;';
      contestName.textContent = contest.name;

      const contestTime = document.createElement('p');
      contestTime.style.cssText = 'margin: 0 0 10px 0; color: #666; font-size: 14px;';
      contestTime.textContent = `Start Time: ${contest.startTime || 'TBD'}`;

      const addButton = document.createElement('button');
      addButton.style.cssText = `
        background: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      `;
      addButton.textContent = '🔔 Add This Contest';
      
      addButton.onclick = () => {
        this.generateAndDownloadICS([contest]);
        dialog.closest('[style*="position: fixed"]')?.remove();
      };

      contestDiv.appendChild(contestName);
      contestDiv.appendChild(contestTime);
      contestDiv.appendChild(addButton);
      dialog.appendChild(contestDiv);
    });
  }

  private generateAndDownloadICS(contests: Array<{id: string, name: string, startTime?: string, endTime?: string}>): void {
    const icsContent = this.generateICSContent(contests);
    
    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = contests.length === 1 
      ? `codeforces-${contests[0].name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`
      : 'codeforces-contests.ics';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    // Show success message
    this.showSuccessMessage(contests.length);
  }

  private generateICSContent(contests: Array<{id: string, name: string, startTime?: string, endTime?: string}>): string {
    const now = new Date();
    const nowFormatted = this.formatDateForICS(now);
    
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Competitive Companion//Codeforces Contests//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    contests.forEach((contest, index) => {
      const uid = `codeforces-${contest.id}-${now.getTime()}@competitive-companion`;
      
      // Parse start time and end time
      let startTimeFormatted = nowFormatted;
      let endTimeFormatted = this.formatDateForICS(new Date(now.getTime() + 2.5 * 60 * 60 * 1000));
      
      if (contest.startTime && contest.startTime !== 'TBD' && contest.startTime !== '待定') {
        try {
          let startDate: Date;
          
          // Handle Codeforces date format: "Jun/08/2025 17:35"
          if (contest.startTime.includes('/')) {
            const parts = contest.startTime.split(' ');
            if (parts.length === 2) {
              const datePart = parts[0]; // "Jun/08/2025"
              const timePart = parts[1]; // "17:35"
              
              // Convert to standard format
              const [month, day, year] = datePart.split('/');
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const monthIndex = monthNames.indexOf(month);
              
              if (monthIndex !== -1) {
                startDate = new Date(parseInt(year), monthIndex, parseInt(day));
                const [hours, minutes] = timePart.split(':');
                startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              } else {
                startDate = new Date(contest.startTime);
              }
            } else {
              startDate = new Date(contest.startTime);
            }
          } else {
            startDate = new Date(contest.startTime);
          }
          
          if (!isNaN(startDate.getTime())) {
            startTimeFormatted = this.formatDateForICS(startDate);
            
            // Use calculated end time if available, otherwise default to 2.5 hours
            if (contest.endTime) {
              const endDate = new Date(contest.endTime);
              if (!isNaN(endDate.getTime())) {
                endTimeFormatted = this.formatDateForICS(endDate);
              }
            } else {
              endTimeFormatted = this.formatDateForICS(new Date(startDate.getTime() + 2.5 * 60 * 60 * 1000));
            }
          }
        } catch (e) {
          // Silent fallback - use default times if parsing fails
        }
      }

      icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTART:${startTimeFormatted}
DTEND:${endTimeFormatted}
DTSTAMP:${nowFormatted}
SUMMARY:${contest.name}
DESCRIPTION:Codeforces Programming Contest\\n\\nRegister at: https://codeforces.com/contest/${contest.id}
URL:https://codeforces.com/contest/${contest.id}
LOCATION:Online (Codeforces)
CATEGORIES:Programming Contest
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${contest.name} starts in 30 minutes
END:VALARM
BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${contest.name} starts in 5 minutes
END:VALARM
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
  }

  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private showSuccessMessage(contestCount: number): void {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      z-index: 10001;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;
    message.textContent = `✅ Successfully generated calendar file for ${contestCount} contest${contestCount > 1 ? 's' : ''}! Check your downloads folder.`;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  private calculateEndTime(startTime: string, duration: string): string | undefined {
    try {
      // Parse duration (format like "02:15" or "2:00")
      const durationMatch = duration.match(/(\d+):(\d+)/);
      if (!durationMatch) {
        return undefined;
      }
      
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const durationMs = (hours * 60 + minutes) * 60 * 1000;
      
      // Parse start time - handle various formats
      let startDate: Date;
      
      // Handle Codeforces date format: "Jun/08/2025 17:35"
      if (startTime.includes('/')) {
        const parts = startTime.split(' ');
        if (parts.length === 2) {
          const datePart = parts[0]; // "Jun/08/2025"
          const timePart = parts[1]; // "17:35"
          
          // Convert to standard format
          const [month, day, year] = datePart.split('/');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = monthNames.indexOf(month);
          
          if (monthIndex !== -1) {
            startDate = new Date(parseInt(year), monthIndex, parseInt(day));
            const [hours, minutes] = timePart.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else {
            startDate = new Date(startTime);
          }
        } else {
          startDate = new Date(startTime);
        }
      } else {
        // Try parsing as-is
        startDate = new Date(startTime);
      }
      
      if (isNaN(startDate.getTime())) {
        return undefined;
      }
      
      const endDate = new Date(startDate.getTime() + durationMs);
      return endDate.toISOString();
    } catch (e) {
      return undefined;
    }
  }
}
