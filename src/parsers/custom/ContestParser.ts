import * as $ from 'jquery';
import Parser from "../Parser";
import Sendable from "../../models/Sendable";
import Contest from "../../models/Contest";

export default abstract class ContestParser extends Parser {
  abstract problemParser: Parser;
  abstract linkSelector: string;

  canHandlePage(): boolean {
    return $(this.linkSelector).length > 0;
  }

  parse(html: string): Promise<Sendable> {
    return this.parseLinks($(html).find(this.linkSelector));
  }

  protected parseLinks(links: JQuery): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      try {
        const bodies = await this.fetchAll(links.toArray().map(link => $(link).prop('href')));
        const tasks = [];

        for (let i = 0; i < bodies.length; i++) {
          const task = await this.problemParser.parse(bodies[i]);
          tasks.push(task);
        }

        resolve(new Contest(tasks));
      } catch (err) {
        reject(err);
      }
    });
  }
}
