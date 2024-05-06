import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class KilonovaProblemParser extends Parser {
    public getMatchPatterns(): string[] {
        return ['https://kilonova.ro/problems/*', 'https://kilonova.ro/contests/*/problems/*'];
    }

    public async parse(url: string, html: string): Promise<Sendable> {
        const elem = htmlToElement(html);
        const task = new TaskBuilder('Kilonova').setUrl(url);

        const title = elem.querySelector('div.segment-panel > h1 > b').textContent.trim();
        if (!title.match(/|/)) {
            task.setName(title)
            task.setCategory(elem.querySelector('summary > h2 > a').textContent.trim());
        } else {
            const [category, name] = title.split(" | ")
            task.setName(name.trim())
            task.setCategory(category.trim())
        }

        const [timeLimit, memoryLimit, input, output] =
            Array.from(elem.querySelectorAll('div.w-full.mb-6.mt-2.text-center h5'))
                .map(h3 => {
                    return h3.textContent.trim()
                });

        // As of now, there's no definitive way to check if a problem is
        // interactive or not. I could check the tags, but that would be 
        // more of an heuristic than anything solid I can rely on.
        task.setInteractive(false);

        task.setTimeLimit(parseFloat(/([0-9.]+)s/.exec(timeLimit)[1]) * 1000);
        task.setMemoryLimit(parseInt(/(\d+)MB/.exec(memoryLimit)[1], 10));

        var inputFile = input.match(/:\s+(.*)/)[1];
        var outputFile = output.match(/:\s+(.*)/)[1];

        if (!inputFile.endsWith(".in")) {
            task.setInput({ type: "stdin" })
        } else {
            task.setInput({ type: "file", fileName: inputFile })
        }

        if (!outputFile.endsWith(".out")) {
            task.setOutput({ type: "stdout" })
        } else {
            task.setOutput({ type: "file", fileName: outputFile })
        }

        this.parseTests(html, task);

        // It's too hard to parse from a problem statement whether it is single
        // or multiNumber, so I'll set it as false and call it a day.
        task.setTestType(TestType.Single);

        console.log(task)

        return task.build();
    }

    public parseTests(html: string, task: TaskBuilder): void {
        const elem = htmlToElement(html);

        let blocks = elem.querySelectorAll('pre code');

        for (let i = 0; i < blocks.length - 1; i += 2) {
            task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
        }
    }
}
