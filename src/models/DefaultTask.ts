import Task from './Task';

export class DefaultTask extends Task {
  constructor(public website: DefaultWebsite, public body: string) {
    super();
  }

  toString(): string {
    return this.website + '\n' + this.body;
  }
}

export enum DefaultWebsite {
  AtCoder = 'atcoder',
  Bayan = 'bayan',
  CSAcademy = 'csacademy',
  CodeChef = 'codechef',
  Codeforces = 'codeforces',
  FacebookHackerCup = 'facebook',
  GoogleCodeJam = 'gcj',
  HackerEarth = 'hackerearth',
  HackerRank = 'hackerrank',
  Kattis = 'kattis',
  Usaco = 'usaco',
  Yandex = 'yandex',
}
