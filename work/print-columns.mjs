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
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

async function run() {
  const GID = '182615786';
  const CSV_URL = `https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=${GID}`;
  const res = await fetch(CSV_URL);
  const csvText = await res.text();
  const rawRows = parseCsv(csvText);
  const records = rawRows.filter(r => r.some(c => c.trim() !== ''));

  console.log('COLUMNS PRINT:');
  for (let r = 0; r < records.length; r++) {
    console.log(`\nRow ${r}:`);
    const row = records[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c] && row[c].trim()) {
        console.log(`  Col ${c}: "${row[c]}"`);
      }
    }
  }
}

run();
