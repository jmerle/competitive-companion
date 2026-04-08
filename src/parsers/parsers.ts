import { CSGOJContestParser } from './contest/CSGOJContestParser';
import { CSGOJProblemParser } from './problem/CSGOJProblemParser';

export const parsers: Parser[] = [
  new CSGOJProblemParser(),
  new CSGOJContestParser(),
];
