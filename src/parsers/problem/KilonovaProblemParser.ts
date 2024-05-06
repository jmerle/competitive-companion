import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class KilonovaProblemParser extends Parser {
    public getMatchPatterns(): string[] {
        return ['https://kilonova.ro/problems/*', 'https://kilonova.ro/contests/*/problems/*'];
    }

    public async parse(url: string, html: string): Promise<Sendable> {
        try {
            const elem = htmlToElement(html);
            const task = new TaskBuilder('Kilonova').setUrl(url);

            this.parseTitle(elem, task);
            this.parseDetails(elem, task);
            this.parseInputOutput(elem, task);
            this.parseTests(html, task);

            return task.build();
        } catch (error) {
            console.error("An error occurred during parsing:", error);
            throw error;
        }
    }

    private parseTitle(elem: Element, task: TaskBuilder) {
        const titleElement = elem.querySelector('div.segment-panel > h1 > b');
        if (!titleElement) {
            throw new Error("Title element not found.");
        }
        const title = titleElement.textContent.trim();
        if (title.indexOf(" | ") === -1) {
            task.setName(title)
            task.setCategory(elem.querySelector('summary > h2 > a[href^="/"]').textContent.trim());
        } else {
            const [category, name] = title.split(" | ")
            task.setName(name.trim())
            task.setCategory(category.trim())
        }
    }

    private parseDetails(elem: Element, task: TaskBuilder): void {
        const details = elem.querySelectorAll('div.w-full.mb-6.mt-2.text-center h5');
        if (details.length < 4) {
            throw new Error("Details not found or incomplete.");
        }

        const timeLimitMatch = /(\d+(?:\.\d+)?)\s*s/i.exec(details[0].textContent.trim());
        const memoryLimitMatch = /(\d+)\s*MB/i.exec(details[1].textContent.trim());

        if (!timeLimitMatch || !memoryLimitMatch) {
            throw new Error("Failed to parse time limit or memory limit.");
        }

        const timeLimitSeconds = parseFloat(timeLimitMatch[1]);
        const memoryLimitMB = parseInt(memoryLimitMatch[1], 10);

        task.setTimeLimit(timeLimitSeconds * 1000); // Convert to milliseconds
        task.setMemoryLimit(memoryLimitMB);
    }

    private parseInputOutput(elem: Element, task: TaskBuilder): void {
        const details = elem.querySelectorAll('div.w-full.mb-6.mt-2.text-center h5');
        if (details.length < 4) {
            throw new Error("Details not found or incomplete.");
        }

        const inputFileMatch = /:\s*(\S+)/.exec(details[2].textContent.trim());
        const outputFileMatch = /:\s*(\S+)/.exec(details[3].textContent.trim());
    
        if (!inputFileMatch || !outputFileMatch) {
            throw new Error("Failed to parse input file or output file.");
        }
    
        const inputFile = inputFileMatch[1];
        const outputFile = outputFileMatch[1];

        const isStdin = details[2]?.querySelector('kn-glossary[content="stdin"]');
        const isStdout = details[3]?.querySelector('kn-glossary[content="stdout"]');

        if (isStdin) {
            task.setInput({ type: "stdin" });
        } else {
            task.setInput({ type: "file", fileName: inputFile });
        }

        if (isStdout) {
            task.setOutput({ type: "stdout" });
        } else {
            task.setOutput({ type: "file", fileName: outputFile });
        }
    }

    public parseTests(html: string, task: TaskBuilder): void {
        const elem = htmlToElement(html);

        let blocks = elem.querySelectorAll('pre code');

        for (let i = 0; i < blocks.length - 1; i += 2) {
            task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
        }
    }
}
