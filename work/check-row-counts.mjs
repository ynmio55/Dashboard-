const urls = [
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=1870394303',
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=1870394303&range=A1%3ADV187',
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=1870394303&range=A1%3ADV220',
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/export?format=csv&gid=1870394303',
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/pub?gid=1870394303&single=true&output=csv',
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((row) => row.some((cell) => String(cell).trim()));
}

for (const url of urls) {
  const response = await fetch(url, { redirect: 'follow' });
  const text = await response.text();
  const rows = parseCsv(text);
  console.log('\nURL:', url);
  console.log('status:', response.status);
  console.log('final:', response.url);
  console.log('chars:', text.length);
  console.log('data rows:', Math.max(0, rows.length - 1));
  console.log('first:', text.slice(0, 100).replace(/\n/g, ' '));
  console.log('last rows:', rows.slice(-5).map((row) => row.slice(0, 4)));
}
