import { config } from './utils/config';
import { noop } from './utils/noop';

const customPortsInput = document.querySelector<HTMLInputElement>('#custom-ports');
const customRulesContainer = document.querySelector<HTMLDivElement>('#custom-rules-container');
const requestTimeoutInput = document.querySelector<HTMLInputElement>('#request-timeout');
const debugModeInput = document.querySelector<HTMLInputElement>('#debug-mode');

function updateCustomRules(): void {
  const rows = customRulesContainer.querySelectorAll('.custom-rules-row');
  const rules: [string, string][] = [];
  const invalidExpressions: string[] = [];

  rows.forEach(row => {
    const expression = row.querySelector('input').value;
    const parserName = row.querySelector('select').value;

    try {
      new RegExp(expression);
    } catch (err) {
      invalidExpressions.push(expression);
    }

    rules.push([expression, parserName]);
  });

  if (rules[rules.length - 1][0].length > 0) {
    rows[rows.length - 1].querySelector('button').classList.remove('hidden');
    addCustomRulesRow();
  }

  const errorElem = document.querySelector('#custom-rules-error');

  if (invalidExpressions.length > 0) {
    const formattedExpressions = invalidExpressions.map(expression => `'${expression}'`);
    if (formattedExpressions.length === 1) {
      errorElem.textContent = `The following regular expression is invalid: ${formattedExpressions[0]}`;
    } else {
      const expressionList = formattedExpressions.slice(0, -1).join(', ') + ' and ' + formattedExpressions.slice(-1);
      errorElem.textContent = `The following regular expressions are invalid: ${expressionList}`;
    }

    errorElem.classList.remove('hidden');

    return;
  }

  errorElem.classList.add('hidden');

  const nonEmptyRules = rules.filter(rule => rule[0].trim().length > 0);
  config.set('customRules', nonEmptyRules).then(noop).catch(noop);
}

function addCustomRulesRow(regex?: string, parserName?: string): void {
  const row = document.createElement('div');
  row.classList.add('custom-rules-row');

  const input = document.createElement('input');
  input.placeholder = 'Regular expression';
  input.value = regex !== undefined ? regex : '';

  const select = document.createElement('select');
  for (const parser of PARSER_NAMES) {
    const option = document.createElement('option');
    option.value = parser;
    option.textContent = parser;
    option.selected = parser === parserName;

    if (parserName === undefined && PARSER_NAMES[0] === parser) {
      option.selected = true;
    }

    select.add(option);
  }

  const button = document.createElement('button');
  button.textContent = 'X';

  if (regex === undefined) {
    button.classList.add('hidden');
  }

  button.addEventListener('click', () => {
    if (!button.classList.contains('hidden')) {
      row.remove();
      updateCustomRules();
    }
  });

  input.addEventListener('input', () => updateCustomRules());
  select.addEventListener('change', () => updateCustomRules());

  row.appendChild(input);
  row.appendChild(select);
  row.appendChild(button);

  customRulesContainer.appendChild(row);
}

customPortsInput.addEventListener('input', function (): void {
  const ports = this.value
    .split(',')
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .map(x => Number(x));

  const uniquePorts = [...new Set(ports)];

  const errorElem = document.querySelector('#custom-ports-error');

  if (uniquePorts.some(isNaN) || uniquePorts.some(x => x < 0)) {
    errorElem.classList.add('hidden');
  } else {
    errorElem.classList.remove('hidden');

    config.set('customPorts', uniquePorts).then(noop).catch(noop);
  }
});

requestTimeoutInput.addEventListener('input', function (): void {
  const value = this.valueAsNumber;
  config
    .set('requestTimeout', value < 1 ? 1 : value)
    .then(noop)
    .catch(noop);
});

debugModeInput.addEventListener('input', function (): void {
  config.set('debugMode', this.checked).then(noop).catch(noop);
});

config
  .get('customPorts')
  .then(value => {
    customPortsInput.value = value.join(',');
  })
  .catch(noop);

config
  .get('customRules')
  .then(rules => {
    for (const rule of rules) {
      addCustomRulesRow(rule[0], rule[1]);
    }

    addCustomRulesRow();
  })
  .catch(noop);

config
  .get('requestTimeout')
  .then(value => {
    requestTimeoutInput.valueAsNumber = value;
  })
  .catch(noop);

config
  .get('debugMode')
  .then(value => {
    debugModeInput.checked = value;
  })
  .catch(noop);
