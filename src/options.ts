import { Config } from './utils/Config';

const customPortsInput = () => document.querySelector('#custom-ports') as HTMLInputElement;

let timeout: any = -1;

function save() {
  const ports = customPortsInput()
    .value
    .split(',')
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .map(x => parseInt(x, 10));

  const uniquePorts = [...new Set(ports)];

  if (uniquePorts.some(isNaN)) {
    setStatus('Please make sure all ports are valid, and multiple ports are separated by commas.');
  } else {
    Config.set('customPorts', uniquePorts).then(() => {
      if (timeout === -1) {
        setStatus('Saved!');

        timeout = setTimeout(() => {
          timeout = -1;
          setStatus('');
        }, 1500);
      }
    }).catch(console.error);
  }
}

function setStatus(status: string) {
  document.querySelector('#status').textContent = status;
}

function load() {
  Config.get<number[]>('customPorts', []).then(ports => {
    customPortsInput().value = ports.join(',');
  }).catch(console.error);
}

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();
  save();
});

load();
