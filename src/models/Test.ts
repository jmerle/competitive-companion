export class Test {
  private input: string;
  private output: string;

  constructor(input: string, output: string) {
    this.setInput(input);
    this.setOutput(output);
  }

  getInput(): string {
    return this.input;
  }

  setInput(input: string) {
    this.input = this.correctData(input);
  }

  getOutput(): string {
    return this.output;
  }

  setOutput(output: string) {
    this.output = this.correctData(output);
  }

  private correctData(data: string): string {
    const correctedData = data.replace(/<br>/g, '\n');
    return correctedData.endsWith('\n') ? correctedData : correctedData + '\n';
  }
}
