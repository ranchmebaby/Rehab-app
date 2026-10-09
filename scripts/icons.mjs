// Renders icons/icon.svg to the PNG sizes iOS and Android need.
// Usage: node scripts/icons.mjs   (requires Playwright + Chromium)
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../icons/', import.meta.url));
const svg = await readFile(`${dir}icon.svg`, 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
const jobs = [
  ['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['apple-touch-icon.png', 180, 0], ['icon-maskable-512.png', 512, 0.1],
];
for (const [name, size, inset] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  const pad = Math.round(size * inset);
  await page.setContent(`<body style="margin:0;background:#0f766e"><div style="padding:${pad}px;width:${size}px;height:${size}px;box-sizing:border-box">${svg.replace('<svg ', `<svg width="${size - pad * 2}" height="${size - pad * 2}" `)}</div></body>`);
  await page.screenshot({ path: `${dir}${name}`, clip: { x: 0, y: 0, width: size, height: size } });
}
await browser.close();
console.log('icons written');
