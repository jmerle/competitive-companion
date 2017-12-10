export default class Test {
  private _input: string;
  private _output: string;

  constructor(input: string, output: string) {
    this.input = input;
    this.output = output;
  }

  get input(): string {
    return this._input;
  }

  set input(newInput: string) {
    this._input = this.correctData(newInput);
  }

  get output(): string {
    return this._output;
  }

  set output(newOutput: string) {
    this._output = this.correctData(newOutput);
  }

  private correctData(data: string): string {
    const correctedData = data.replace(/<br>/g, '\n');
    return correctedData.endsWith('\n') ? correctedData : correctedData + '\n';
  }
}
