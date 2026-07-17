import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';

const svg = readFileSync(new URL('../public/icon.svg', import.meta.url));

const sizes = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of sizes) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  writeFileSync(new URL(`../public/${name}`, import.meta.url), png);
  console.log(`wrote public/${name} (${size}x${size})`);
}
