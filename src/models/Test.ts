export class Test {
  public input: string;
  public output: string;

  public constructor(input: string, output: string) {
    this.input = this.correctData(input);
    this.output = this.correctData(output);
  }

  private correctData(data: string): string {
    const correctedData = data
      .replace(/<br>/g, '\n')
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .trimEnd();

    return correctedData.endsWith('\n') ? correctedData : correctedData + '\n';
  }
}
