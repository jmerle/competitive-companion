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

  addTest(test: Test): TaskBuilder {
    this.tests.push(test);
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
    const name = this.removeCyrillics(this.name);

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

    return this.setJavaTaskClass(taskClass);
  }

  removeCyrillics(str: string): string {
    // Taken from https://github.com/EgorKulikov/idea-chelper/blob/7974d411497da0cc087dc29164553d266974b068/src/net/egork/chelper/util/TaskUtilities.java#L40
    return str.split('').map(char => {
      console.log(char);

      switch (char) {
        case 'а':
          return 'a';
        case 'б':
          return 'b';
        case 'в':
          return 'v';
        case 'г':
          return 'g';
        case 'д':
          return 'd';
        case 'е':
          return 'e';
        case 'ё':
          return 'jo';
        case 'ж':
          return 'j';
        case 'з':
          return 'z';
        case 'и':
          return 'i';
        case 'й':
          return 'j';
        case 'к':
          return 'k';
        case 'л':
          return 'l';
        case 'м':
          return 'm';
        case 'н':
          return 'n';
        case 'о':
          return 'o';
        case 'п':
          return 'p';
        case 'р':
          return 'r';
        case 'с':
          return 's';
        case 'т':
          return 't';
        case 'у':
          return 'u';
        case 'ф':
          return 'f';
        case 'х':
          return 'h';
        case 'ц':
          return 'c';
        case 'ч':
          return 'ch';
        case 'ш':
          return 'sh';
        case 'щ':
          return 'sch';
        case 'ъ':
          return '';
        case 'ы':
          return 'y';
        case 'ь':
          return '';
        case 'э':
          return 'e';
        case 'ю':
          return 'ju';
        case 'я':
          return 'ja';
        case 'А':
          return 'A';
        case 'Б':
          return 'B';
        case 'В':
          return 'V';
        case 'Г':
          return 'G';
        case 'Д':
          return 'D';
        case 'Е':
          return 'E';
        case 'Ё':
          return 'Jo';
        case 'Ж':
          return 'J';
        case 'З':
          return 'Z';
        case 'И':
          return 'I';
        case 'Й':
          return 'J';
        case 'К':
          return 'K';
        case 'Л':
          return 'L';
        case 'М':
          return 'M';
        case 'Н':
          return 'N';
        case 'О':
          return 'O';
        case 'П':
          return 'P';
        case 'Р':
          return 'R';
        case 'С':
          return 'S';
        case 'Т':
          return 'T';
        case 'У':
          return 'U';
        case 'Ф':
          return 'F';
        case 'Х':
          return 'H';
        case 'Ц':
          return 'C';
        case 'Ч':
          return 'Ch';
        case 'Ш':
          return 'Sh';
        case 'Щ':
          return 'Sch';
        case 'Ъ':
          return '';
        case 'Ы':
          return 'Y';
        case 'Ь':
          return '';
        case 'Э':
          return 'E';
        case 'Ю':
          return 'Ju';
        case 'Я':
          return 'Ja';
        default:
          return char;
      }
    }).join('');
  }

  build(): Task {
    return new Task(this.name, this.group, this.url, this.memoryLimit, this.timeLimit,
      this.tests, this.testType, this.input, this.output, this.languages);
  }
}
