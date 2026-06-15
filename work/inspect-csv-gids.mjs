const sheetId = '1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE';
const gids = ['1870394303', '128247472', '1431827930', '182615786'];

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
  return rows;
}

for (const gid of gids) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const response = await fetch(url);
  const text = await response.text();
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim()));
  const headers = rows[0] || [];
  const rosaMatches = text.match(/ROSA|โรซา|ความเสี่ยง/gi) || [];
  console.log('\n--- gid', gid);
  console.log('status', response.status, 'chars', text.length, 'rows', Math.max(0, rows.length - 1), 'cols', headers.length);
  console.log('headers', headers.slice(0, 18));
  console.log('rosa-like matches', rosaMatches.slice(0, 20), 'count', rosaMatches.length);
  console.log('first rows');
  console.log(rows.slice(0, 5).map((row) => row.slice(0, 12)));
}
