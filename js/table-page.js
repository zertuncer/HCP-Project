document.addEventListener('DOMContentLoaded', async () => {
  try { await loadHcpDataFromSheet?.(); } catch (e) { console.warn('Sheet load failed', e); }
  renderTable();
  wireTableSearch();
});

function getAllRows() {
  const rows = [];
  const countries = Object.keys(hcpData || {}).sort();
  countries.forEach(country => {
    const list = hcpData[country] || [];
    list.forEach(item => rows.push({ country, ...item }));
  });
  return rows;
}

function renderTable(filter = '') {
  const tbody = document.querySelector('#hcpTable tbody');
  if (!tbody) return;
  const search = filter.trim().toLowerCase();
  const rows = getAllRows().filter(r =>
    search === '' ||
    [r.country, r.name, r.title, r.city, r.state, r.hospital, r.contact, r.info, r.notes, r.recommender]
      .join(' | ').toLowerCase().includes(search)
  );
  const toCell = (v) => (v || '').toString();
  const html = rows.map(r => `
    <tr>
      <td>${toCell(r.country)}</td>
      <td>${toCell(r.name)}</td>
      <td>${toCell(r.title)}</td>
      <td>${toCell(r.city)}</td>
      <td>${toCell(r.state)}</td>
      <td>${toCell(r.hospital)}</td>
      <td>${toCell(r.contact)}</td>
      <td>${toCell(r.info)}</td>
      <td>${toCell(r.notes)}</td>
      <td>${toCell(r.recommender)}</td>
    </tr>
  `).join('');
  tbody.innerHTML = html;
}

function wireTableSearch() {
  const input = document.getElementById('tableSearch');
  const clearBtn = document.getElementById('clearTableSearch');
  if (!input || !clearBtn) return;
  input.addEventListener('input', () => renderTable(input.value));
  clearBtn.addEventListener('click', () => { input.value = ''; renderTable(''); });
}


