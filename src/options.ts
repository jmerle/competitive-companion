import { config } from './utils/config';
import { noop } from './utils/noop';

const customPortsInput = document.querySelector<HTMLInputElement>('#custom-ports');
const debugModeInput = document.querySelector<HTMLInputElement>('#debug-mode');

customPortsInput.addEventListener('input', function (): void {
  const ports = this.value
    .split(',')
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .map(x => Number(x));

  const uniquePorts = [...new Set(ports)];

  if (uniquePorts.some(isNaN) || uniquePorts.some(x => x < 0)) {
    document.querySelector<HTMLElement>('#custom-ports-error').style.display = 'block';
  } else {
    document.querySelector<HTMLElement>('#custom-ports-error').style.display = 'none';

    config.set('customPorts', uniquePorts).then(noop).catch(noop);
  }
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
  .get('debugMode')
  .then(value => {
    debugModeInput.checked = value;
  })
  .catch(noop);
