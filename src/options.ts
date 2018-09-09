import { config } from './utils/config';

const customPortsInput = document.querySelector(
  '#custom-ports',
) as HTMLInputElement;
const debugModeInput = document.querySelector(
  '#debug-mode',
) as HTMLInputElement;

customPortsInput.addEventListener('input', function() {
  const ports = this.value
    .split(',')
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .map(x => Number(x));

  const uniquePorts = [...new Set(ports)];

  if (uniquePorts.some(isNaN) || uniquePorts.some(x => x < 0)) {
    (document.querySelector(
      '#custom-ports-error',
    ) as HTMLElement).style.display = 'block';
  } else {
    (document.querySelector(
      '#custom-ports-error',
    ) as HTMLElement).style.display = 'none';

    config
      .set('customPorts', uniquePorts)
      .then(() => {})
      .catch(() => {});
  }
});

debugModeInput.addEventListener('input', function() {
  config
    .set('debugMode', this.checked)
    .then(() => {})
    .catch(() => {});
});

config
  .get<number[]>('customPorts')
  .then(value => {
    customPortsInput.value = value.join(',');
  })
  .catch(() => {});

config
  .get<boolean>('debugMode')
  .then(value => {
    debugModeInput.checked = value;
  })
  .catch(() => {});
