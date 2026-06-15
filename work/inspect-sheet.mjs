import fs from 'node:fs';

const html = fs.readFileSync('work/sheet.html', 'utf8');
const names = ['การตอบแบบฟอร์ม 1', 'ตาราง Pivot 1', 'ตาราง Pivot 2', 'วิเคราะห์', 'ROSA'];

for (const name of names) {
  const index = html.indexOf(name);
  console.log('\n---', name, index);
  if (index >= 0) {
    console.log(html.slice(Math.max(0, index - 250), index + 400).replace(/\s+/g, ' ').slice(0, 900));
  }
}

const gids = [
  ...new Set([...html.matchAll(/\[\[\\"(\d{5,})\\"/g)].map((match) => match[1])),
];
console.log('\ngids', gids, 'count', gids.length);
