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
  const sheetId = '1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE';
  const gids = ['1870394303', '128247472', '1431827930', '182615786'];
  
  for (const gid of gids) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      const rows = parseCsv(text).filter(r => r.some(c => c.trim() !== ''));
      console.log(`\n================= GID: ${gid} =================`);
      console.log(`Rows: ${rows.length}, Columns: ${rows[0] ? rows[0].length : 0}`);
      console.log('Sample Headers (first 10):', rows[0] ? rows[0].slice(0, 10) : 'None');
      console.log('Sample Row 1 (first 10):', rows[1] ? rows[1].slice(0, 10) : 'None');
      console.log('Sample Row 2 (first 10):', rows[2] ? rows[2].slice(0, 10) : 'None');
    } catch (e) {
      console.error(`Error fetching GID ${gid}:`, e.message);
    }
  }
}

run();
