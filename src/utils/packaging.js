export function parsePackagingDescription(description) {
  const rows = [];
  let current = null;

  for (const line of String(description || '').split(/\r?\n/).map((value) => value.trim()).filter(Boolean)) {
    const packageHeader = line.match(/^(\d+)\s*[x×]\s*(.+)$/i);
    if (packageHeader) {
      current = { Quantity: packageHeader[1], 'Packaging Type': packageHeader[2] };
      rows.push(current);
      continue;
    }

    if (!current) {
      current = {};
      rows.push(current);
    }

    const field = line.match(/^(.+?)\s+(?:-|–|—|:)\s*(.*)$/) || line.match(/^([^:]+):\s*(.*)$/);
    const label = field ? field[1].trim() : 'Description';
    const value = field ? field[2].trim() : line;
    current[label] = current[label] ? `${current[label]}\n${value}` : value;
  }

  return rows;
}
