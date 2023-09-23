// @ts-check

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const __dirname = new URL('.', import.meta.url).pathname;

main();

async function main() {
  const bundleScript = await readFile(join(__dirname, '../dist/geojsonmap.js'), { encoding: 'utf-8' });

  const lines = bundleScript.split('\n');

  const filteredLines = lines
    .filter((line, index) => {
      return !(
        (index > 0 && line.includes('@ts-check'))
        || (line.includes('import') && line.includes('ViewBox'))
        || (line.includes('import') && line.includes('GeoJsonMap'))
      );
    });

  const filteredScript = filteredLines.join('\n');

  await writeFile(join(__dirname, '../dist/geojsonmap.js'), filteredScript, { encoding: 'utf-8' });
}
