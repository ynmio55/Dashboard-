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
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=1870394303';
  const res = await fetch(CSV_URL);
  const csvText = await res.text();
  const rawRows = parseCsv(csvText);
  const headers = rawRows[0];
  const records = rawRows.slice(1).filter(r => r.some(c => c.trim() !== ''));
  
  console.log('Headers count:', headers.length);
  console.log('Total records:', records.length);
  
  const genderIndex = headers.indexOf('เพศ');
  console.log('Gender index:', genderIndex);
  if (genderIndex !== -1) {
    const genders = {};
    records.forEach(r => {
      const g = r[genderIndex] || 'N/A';
      genders[g] = (genders[g] || 0) + 1;
    });
    console.log('Gender distribution:', genders);
  } else {
    console.log('Gender header not found. Headers containing "เพศ":', headers.filter(h => h.includes('เพศ')));
  }

  const prePostIndex = headers.indexOf('Pre-test / Post-test');
  console.log('Pre/Post index:', prePostIndex);
  if (prePostIndex !== -1) {
    const prePost = {};
    records.forEach(r => {
      const val = r[prePostIndex] || 'N/A';
      prePost[val] = (prePost[val] || 0) + 1;
    });
    console.log('Pre/Post distribution:', prePost);
  }

  console.log('A sample row details:');
  const sample = records[0];
  headers.forEach((h, idx) => {
    if (h.trim() && (idx < 15 || h.includes('เพศ') || h.includes('Pre-test') || h.includes('Kรวม') || h.includes('Beเฉลี่ย'))) {
      console.log(`- ${h}: ${sample[idx]}`);
    }
  });
}

run();
