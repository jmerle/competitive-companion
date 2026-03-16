import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class JvUmsaProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://jv.umsa.bo/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('JV UMSA').setUrl(url);

    // --- 1. EXTRAER TÍTULO ---
    const titleElement = elem.querySelector('h2.text-xl.font-bold');
    let rawName = titleElement ? titleElement.textContent.trim() : 'Problema UMSA';
    // Limpiamos el nombre de caracteres raros
    task.setName(rawName.replace(/[^a-zA-Z0-9_ -]/g, '').trim());

    // --- 2. LÍMITES ---
    task.setTimeLimit(1000);
    task.setMemoryLimit(256);

    // --- 3. EXTRAER CASOS DE PRUEBA ---
    const inputs = elem.querySelectorAll('pre[id^="samplein"]');
    const outputs = elem.querySelectorAll('pre[id^="sampleout"]');

    const numTests = Math.max(inputs.length, outputs.length);

    for (let i = 0; i < numTests; i++) {
      let inputText = i < inputs.length ? (inputs[i].textContent || "") : "";
      let outputText = i < outputs.length ? (outputs[i].textContent || "") : "";

      // FIX DEFINITIVO PARA COMPETITEST.NVIM:
      // Si la entrada no existe o está vacía, enviamos un texto de relleno ("0\n").
      // Esto obliga a Neovim a crear el archivo físico en tu disco y evita que Lua explote.
      if (inputText.trim() === "") inputText = "0\n";
      if (outputText.trim() === "") outputText = "0\n";

      task.addTest(inputText, outputText);
    }

    return task.build();
  }
}
