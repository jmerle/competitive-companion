import { Sendable } from "../../models/Sendable";
import { TaskBuilder } from "../../models/TaskBuilder";
import { htmlToElement } from "../../utils/dom";
import { Parser } from "../Parser";

export class MendoProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://mendo.mk/Task.do?id=*'];
  }
  public getRegularExpressions(): RegExp[] {
    return [/^https?:\/\/(?:www\.)?mendo\.mk\/Task\.do\?id=\d+$/];
  }
  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Mendo').setUrl(url);

    task.setName(elem.querySelector(".pagetitle").textContent);
    
    elem.querySelectorAll('.taskContentView > h3').forEach(x => {
      if (x.textContent.trim() == "Ограничувања") {
        // Македонски
        var results =
          /Временско ограничување: (\d+) ([а-ш]+)Мемориско ограничување: (\d+) ([а-шј]+)/s
          .exec(x.nextElementSibling.textContent);
        var time = parseInt(results[1]), space = parseInt(results[3]);
        if (results[2].slice(0, 6) == "секунд") time *= 1000;
        // За сега нема задачи со <1MB мемориски лимит.
        task.setTimeLimit(time).setMemoryLimit(space);
      }
      if (x.textContent.trim() == "Constraints") {
        // English
        var results =
        /Time limit: (\d+) ([a-z]+)Memory limit: (\d+) ([a-z]+)/s
          .exec(x.nextElementSibling.textContent);
        var time = parseInt(results[1]), space = parseInt(results[3]);
        if (results[2].slice(0, 6) == "second") time *= 1000;
        // As of now there aren't any problems with <1MB space limit.
        task.setTimeLimit(time).setMemoryLimit(space);
      }
    });
    if (elem.querySelector(".taskContentView tbody")) {
      elem.querySelector(".taskContentView tbody").childNodes.forEach(x => {
        var parsed = /^(?:input|влез)\n(.*)(?:output|излез)\n(.*)$/s.exec(x.textContent);
        task.addTest(parsed[1] + "\n", parsed[2] + "\n");
      });
    }
    else {
      // As of now there isn't a better discovered way of checking if it's interactive :rofl:
      task.setInteractive(true);
    }
    task.setJavaMainClass("Main");
    return task.build();
  }
}