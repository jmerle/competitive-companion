import { Test } from './Test';
import { InputConfiguration, OutputConfiguration } from './IOConfiguration';
import { LanguageConfiguration } from './LanguageConfiguration';
import { Task } from './Task';
import { TestType } from './TestType';

export class TaskBuilder {
  public name: string = '';
  public group: string = '';

  public url: string = '';

  public memoryLimit: number = 1024;
  public timeLimit: number = 1000;

  public tests: Test[] = [];
  public testType: TestType = TestType.Single;

  public input: InputConfiguration = { type: 'stdin' };
  public output: OutputConfiguration = { type: 'stdout' };

  public languages: LanguageConfiguration = {
    java: {
      mainClass: 'Main',
      taskClass: '',
    },
  };

  setName(name: string): TaskBuilder {
    this.name = name;
    return this.setJavaTaskClassFromName();
  }

  setGroup(group: string): TaskBuilder {
    this.group = group;
    return this;
  }

  setUrl(url: string): TaskBuilder {
    this.url = url;
    return this;
  }

  setMemoryLimit(memoryLimit: number): TaskBuilder {
    this.memoryLimit = memoryLimit;
    return this;
  }

  setTimeLimit(timeLimit: number): TaskBuilder {
    this.timeLimit = timeLimit;
    return this;
  }

  setTests(tests: Test[]): TaskBuilder {
    this.tests = tests;
    return this;
  }

  addTest(input: string, output: string): TaskBuilder {
    this.tests.push(new Test(input, output));
    return this;
  }

  setTestType(type: TestType): TaskBuilder {
    this.testType = type;
    return this;
  }

  setInput(input: InputConfiguration): TaskBuilder {
    this.input = input;
    return this;
  }

  setOutput(output: OutputConfiguration): TaskBuilder {
    this.output = output;
    return this;
  }

  setJavaMainClass(mainClass: string): TaskBuilder {
    this.languages.java.mainClass = mainClass;
    return this;
  }

  setJavaTaskClass(taskClass: string): TaskBuilder {
    this.languages.java.taskClass = taskClass;
    return this;
  }

  setJavaTaskClassFromName(): TaskBuilder {
    const name = this.name.replace(/[^a-zA-Z0-9_ -]/g, '');

    let taskClass = '';
    let nextCapital = true;

    for (let i = 0; i < name.length; i++) {
      const char = name[i];

      const isLetter = /[a-z]/i.test(char);
      const isDigit = /[0-9]/.test(char);

      if (isLetter || (isDigit && taskClass.length > 0)) {
        taskClass += nextCapital ? char.toUpperCase() : char;
        nextCapital = false;
      } else {
        nextCapital = true;
      }
    }

    return this.setJavaTaskClass(taskClass || 'Task');
  }

  build(): Task {
    return new Task(this.name, this.group, this.url, this.memoryLimit, this.timeLimit,
      this.tests, this.testType, this.input, this.output, this.languages);
  }
}
