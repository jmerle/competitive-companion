import { Parser } from '../Parser';
import { DefaultTask, DefaultWebsite } from '../../models/DefaultTask';
import { Sendable } from '../../models/Sendable';

export abstract class DefaultParser extends Parser {
  abstract website: DefaultWebsite;

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      resolve(new DefaultTask(this.website, html));
    });
  }
}
