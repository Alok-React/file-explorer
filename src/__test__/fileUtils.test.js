import {
  formatSize,
  getFileIcon,
  getFileColor,
  flattenSearch,
  sortNodes,
} from '../utils/fileUtils';

// ─── formatSize ───────────────────────────────────────────────────────────────

describe('formatSize', () => {
  test('returns — for falsy values', () => {
    expect(formatSize(0)).toBe('—');
    expect(formatSize(null)).toBe('—');
    expect(formatSize(undefined)).toBe('—');
  });

  test('formats bytes', () => {
    expect(formatSize(500)).toBe('500 B');
  });

  test('formats kilobytes', () => {
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(2048)).toBe('2.0 KB');
  });

  test('formats megabytes', () => {
    expect(formatSize(1048576)).toBe('1.0 MB');
    expect(formatSize(1572864)).toBe('1.5 MB');
  });

  test('formats gigabytes', () => {
    expect(formatSize(1073741824)).toBe('1.0 GB');
  });

  test('rounds to one decimal', () => {
    expect(formatSize(1536)).toBe('1.5 KB');
  });
});

// ─── getFileIcon ──────────────────────────────────────────────────────────────

describe('getFileIcon', () => {
  test('returns folder icon for folders', () => {
    expect(getFileIcon({ type: 'folder' })).toBe('📁');
  });

  test('returns image icon', () => {
    expect(getFileIcon({ type: 'file', fileType: 'image' })).toBe('🖼️');
  });

  test('returns video icon', () => {
    expect(getFileIcon({ type: 'file', fileType: 'video' })).toBe('🎬');
  });

  test('returns pdf icon', () => {
    expect(getFileIcon({ type: 'file', fileType: 'pdf' })).toBe('📄');
  });

  test('returns other icon for unknown types', () => {
    expect(getFileIcon({ type: 'file', fileType: 'other' })).toBe('📎');
    expect(getFileIcon({ type: 'file', fileType: 'zip' })).toBe('📄');
  });
});

// ─── getFileColor ─────────────────────────────────────────────────────────────

describe('getFileColor', () => {
  test('returns green for images', () => {
    expect(getFileColor('image')).toBe('#22c55e');
  });

  test('returns amber for videos', () => {
    expect(getFileColor('video')).toBe('#f59e0b');
  });

  test('returns red for pdfs', () => {
    expect(getFileColor('pdf')).toBe('#ef4444');
  });

  test('returns purple for folders', () => {
    expect(getFileColor('folder')).toBe('#7c6af5');
  });

  test('returns muted color for unknown types', () => {
    expect(getFileColor('zip')).toBe('#8888aa');
    expect(getFileColor(undefined)).toBe('#8888aa');
  });
});

// ─── flattenSearch ────────────────────────────────────────────────────────────

describe('flattenSearch', () => {
  const tree = [
    {
      id: '1', name: 'Projects', type: 'folder',
      children: [
        { id: '2', name: 'Designs', type: 'folder', children: [
          { id: '3', name: 'LandingPage.png', type: 'file', fileType: 'image' },
        ]},
        { id: '4', name: 'README.txt', type: 'file', fileType: 'other' },
      ],
    },
    { id: '5', name: 'Archives', type: 'folder', children: [] },
  ];

  test('returns empty array when nothing matches', () => {
    expect(flattenSearch(tree, 'zzz')).toHaveLength(0);
  });

  test('finds exact name matches at root', () => {
    const results = flattenSearch(tree, 'Archives');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('5');
  });

  test('finds partial matches case-insensitively', () => {
    const results = flattenSearch(tree, 'readme');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('README.txt');
  });

  test('finds nested items', () => {
    const results = flattenSearch(tree, 'landing');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('3');
  });

  test('attaches _path to results', () => {
    const results = flattenSearch(tree, 'LandingPage');
    expect(results[0]._path).toEqual(['Projects', 'Designs', 'LandingPage.png']);
  });

  test('matches multiple nodes', () => {
    const results = flattenSearch(tree, 'e');
    expect(results.length).toBeGreaterThan(1);
  });

  test('returns empty array for empty tree', () => {
    expect(flattenSearch([], 'test')).toHaveLength(0);
  });
});

// ─── sortNodes ────────────────────────────────────────────────────────────────

describe('sortNodes', () => {
  const nodes = [
    { id: 'f1', name: 'Zebra.txt',   type: 'file',   size: 3000, createdAt: '2024-03-01' },
    { id: 'd1', name: 'Beta',        type: 'folder',  size: 0,    createdAt: '2024-01-01', children: [] },
    { id: 'f2', name: 'Alpha.png',   type: 'file',   size: 1000, createdAt: '2024-01-15' },
    { id: 'd2', name: 'Alpha',       type: 'folder',  size: 0,    createdAt: '2024-02-01', children: [] },
  ];

  test('always puts folders before files', () => {
    const sorted = sortNodes(nodes, 'name', 'asc');
    const types = sorted.map(n => n.type);
    const lastFolder = types.lastIndexOf('folder');
    const firstFile  = types.indexOf('file');
    expect(lastFolder).toBeLessThan(firstFile);
  });

  test('sorts by name ascending', () => {
    const sorted = sortNodes(nodes, 'name', 'asc');
    const folders = sorted.filter(n => n.type === 'folder');
    const files   = sorted.filter(n => n.type === 'file');
    expect(folders[0].name).toBe('Alpha');
    expect(files[0].name).toBe('Alpha.png');
  });

  test('sorts by name descending', () => {
    const sorted = sortNodes(nodes, 'name', 'desc');
    const folders = sorted.filter(n => n.type === 'folder');
    expect(folders[0].name).toBe('Beta');
  });

  test('sorts by size ascending', () => {
    const sorted = sortNodes(nodes, 'size', 'asc');
    const files = sorted.filter(n => n.type === 'file');
    expect(files[0].size).toBe(1000);
    expect(files[1].size).toBe(3000);
  });

  test('sorts by size descending', () => {
    const sorted = sortNodes(nodes, 'size', 'desc');
    const files = sorted.filter(n => n.type === 'file');
    expect(files[0].size).toBe(3000);
  });

  test('sorts by date ascending', () => {
    const sorted = sortNodes(nodes, 'date', 'asc');
    const files = sorted.filter(n => n.type === 'file');
    expect(files[0].createdAt).toBe('2024-01-15');
  });

  test('sorts by date descending', () => {
    const sorted = sortNodes(nodes, 'date', 'desc');
    const files = sorted.filter(n => n.type === 'file');
    expect(files[0].createdAt).toBe('2024-03-01');
  });

  test('handles empty array', () => {
    expect(sortNodes([], 'name', 'asc')).toEqual([]);
  });
});
