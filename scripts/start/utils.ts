import * as fs from 'fs';
import * as path from 'path';
import { projectRoot } from '../utils';

export async function waitForBuild(): Promise<void> {
  const backgroundFile = path.resolve(projectRoot, 'build-extension/js/background.js');
  while (!fs.existsSync(backgroundFile)) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }
}
