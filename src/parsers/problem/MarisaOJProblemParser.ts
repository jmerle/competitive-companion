import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class MarisaOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://marisaoj.com/problem/*',
      'https://marisaoj.com/mashup/*/problem/*',
      'https://m.marisaoj.com/problem/*',
      'https://m.marisaoj.com/mashup/*/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('MarisaOJ').setUrl(url);

    const titleElem = elem.querySelector('.header > h2');
    if (titleElem) {
      task.setName(titleElem.textContent.trim());
    }

    const categoryElem = elem.querySelector('#module-info > .problem-table > caption');
    if (categoryElem) {
      task.setCategory(categoryElem.textContent.trim());
    }

    const [timeLimitElem, memoryLimitElem] = [...elem.querySelectorAll('.header > div')];
    if (timeLimitElem && memoryLimitElem) {
      task.setTimeLimit(parseInt(timeLimitElem.textContent.match(/\d+/)[0], 10));
      task.setMemoryLimit(parseInt(memoryLimitElem.textContent.match(/\d+/)[0], 10));
    }

    const mathContent = elem.querySelector('.math-content');
    if (mathContent) {
      const bodyElems = mathContent.children;

      // Hàm xử lý bóc tách text, tự động xóa các nút/chữ Copy
      const extractCleanText = (el: Element): string => {
        // Nếu testcase được bọc chuẩn trong thẻ code thì lấy luôn
        const codeNode = el.querySelector('code');
        if (codeNode) {
          return codeNode.textContent || '';
        }

        // Tạo clone để không làm hỏng cấu trúc DOM thật
        const clone = el.cloneNode(true) as Element;

        // Cắt bỏ tất cả các button hoặc element mang class chứa từ khóa copy
        clone.querySelectorAll('button, [class*="copy" i]').forEach(n => n.remove());

        let text = clone.textContent || '';

        // Đề phòng chữ Copy ở dạng text node dính ngay đầu chuỗi
        if (text.trim().toLowerCase().startsWith('copy')) {
          text = text.trim().substring(4);
        }

        return text.trimStart(); // Xóa khoảng trắng thừa ở đầu nếu có
      };

      for (let i = 0; i < bodyElems.length; i++) {
        if (bodyElems[i].textContent.includes('Input:')) {
          const inputElem = bodyElems[i + 1];
          const outputElem = bodyElems[i + 3];

          if (inputElem && outputElem) {
            task.addTest(extractCleanText(inputElem), extractCleanText(outputElem));
          }
          i += 3;
        }
      }
    }

    return task.build();
  }
}
