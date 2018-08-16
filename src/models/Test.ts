export class Test {
  private input: string;
  private output: string;

  constructor(input: string, output: string) {
    this.input = this.correctData(input);
    this.output = this.correctData(output);
  }

  public getInput(): string {
    return this.input;
  }

  public setInput(input: string) {
    this.input = this.correctData(input);
  }

  public getOutput(): string {
    return this.output;
  }

  public setOutput(output: string) {
    this.output = this.correctData(output);
  }

  private correctData(data: string): string {
    const correctedData = data.replace(/<br>/g, '\n');
    return correctedData.endsWith('\n') ? correctedData : correctedData + '\n';
  }
}
