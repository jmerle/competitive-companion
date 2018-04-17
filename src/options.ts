import { Config } from './utils/Config';

const customPortsInput = () => document.querySelector('#custom-ports') as HTMLInputElement;

let timeout: any = -1;

function save() {
  const ports = customPortsInput()
    .value
    .split(' ')
    .filter(x => x.trim().length > 0)
    .map(x => parseInt(x, 10));

  if (ports.some(isNaN)) {
    alert('Please make sure all ports are numeric, and multiple ports are separated by spaces.');
  } else {
    Config.set('customPorts', ports).then(() => {
      if (timeout === -1) {
        (document.querySelector('#saved') as HTMLElement).style.visibility = 'visible';

        timeout = setTimeout(() => {
          timeout = -1;
          (document.querySelector('#saved') as HTMLElement).style.visibility = 'hidden';
        }, 1500);
      }
    }).catch(console.error);
  }
}

function load() {
  Config.get<number[]>('customPorts').then(ports => {
    if (ports !== undefined) {
      customPortsInput().value = ports.join(' ');
    }
  }).catch(console.error);
}

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();
  save();
});

load();
