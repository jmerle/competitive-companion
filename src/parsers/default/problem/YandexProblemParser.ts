import { DefaultParser } from '../DefaultParser';
import { DefaultWebsite } from '../../../models/DefaultTask';

export class YandexProblemParser extends DefaultParser {
  website: DefaultWebsite = DefaultWebsite.Yandex;

  getMatchPatterns(): string[] {
    return [
      'https://*.contest.yandex.com/*contest/*/problems*',
      'https://*.contest2.yandex.com/*contest/*/problems*',
      'https://*.contest.yandex.ru/*contest/*/problems*',
      'https://*.contest2.yandex.ru/*contest/*/problems*',
    ];
  }
}
