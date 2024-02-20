export const toLatinMap: { [x: string]: string | undefined } = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  ѓ: 'gj',
  е: 'e',
  ж: 'zh',
  з: 'z',
  ѕ: 'dz',
  и: 'i',
  ј: 'j',
  к: 'k',
  л: 'l',
  љ: 'lj',
  м: 'm',
  н: 'n',
  њ: 'nj',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  ќ: 'kj',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  џ: 'dzh',
  ш: 'sh',
};
export function toLatinChar(ch: string): string {
  let char = ch;
  let uppercase = false;
  if (char.toUpperCase() == char) {
    uppercase = true;
    char = char.toLowerCase();
  }
  char = toLatinMap[char] ?? char;
  if (uppercase) char = char.toUpperCase();
  return char;
}
/**
 * Custom coded function that converts text in other alphabets to Latin
 * @todo Add more languages except cyrilic
 */
export function toLatin(text: string): string {
  let res = '';
  for (let i = 0; i < text.length; i++) res += toLatinChar(text[i]);
  return res;
}
