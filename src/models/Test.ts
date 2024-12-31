export class Test {
  public input: string;
  public output: string;

  public constructor(input: string, output: string, normalizeWhitespace: boolean) {
    this.input = this.correctData(input, normalizeWhitespace);
    this.output = this.correctData(output, normalizeWhitespace);
  }

  private correctData(data: string, normalizeWhitespace: boolean): string {
    data = data.replace('<div class="open_grepper_editor" title="Edit & Save To Grepper"></div>', '');

    if (normalizeWhitespace) {
      data = data
        .replace(/<br>/g, '\n')
        .replace(/&nbsp;/g, '')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trimEnd();
    }

    return data.endsWith('\n') || data.length === 0 ? data : data + '\n';
  }
}
