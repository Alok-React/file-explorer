export function formatSize(bytes) {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0, n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function getFileIcon(node) {
  if (node.type === 'folder') return '📁';
  const icons = { image: '🖼️', video: '🎬', pdf: '📄', other: '📎' };
  return icons[node.fileType] || '📄';
}

export function getFileColor(fileType) {
  const colors = {
    image:  '#22c55e',
    video:  '#f59e0b',
    pdf:    '#ef4444',
    other:  '#8888aa',
    folder: '#7c6af5',
  };
  return colors[fileType] || colors.other;
}

export function flattenSearch(nodes, query, path = []) {
  const results = [];
  for (const n of nodes) {
    const currentPath = [...path, n.name];
    if (n.name.toLowerCase().includes(query.toLowerCase())) {
      results.push({ ...n, _path: currentPath });
    }
    if (n.children) {
      results.push(...flattenSearch(n.children, query, currentPath));
    }
  }
  return results;
}

export function sortNodes(nodes, sortBy, sortDir) {
  const folders = nodes.filter(n => n.type === 'folder');
  const files   = nodes.filter(n => n.type === 'file');
  const sorter  = (a, b) => {
    let v = 0;
    if (sortBy === 'name') v = a.name.localeCompare(b.name);
    else if (sortBy === 'size') v = (a.size || 0) - (b.size || 0);
    else if (sortBy === 'date') v = (a.createdAt || '').localeCompare(b.createdAt || '');
    return sortDir === 'asc' ? v : -v;
  };
  return [...folders.sort(sorter), ...files.sort(sorter)];
}