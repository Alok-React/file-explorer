import { api, findNode, removeNode, updateNode, load, save } from '../data/fileSystem';

// Use fake timers so delay() resolves instantly
beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
  localStorage.clear();
});

// Helper: run an async fn while flushing all timers
async function run(fn) {
  const promise = fn();
  jest.runAllTimers();
  return promise;
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

describe('findNode', () => {
  const tree = [
    { id: '1', name: 'Root', type: 'folder', children: [
      { id: '2', name: 'Child', type: 'file' },
    ]},
  ];

  test('finds root node', () => {
    expect(findNode(tree, '1')?.name).toBe('Root');
  });

  test('finds nested node', () => {
    expect(findNode(tree, '2')?.name).toBe('Child');
  });

  test('returns null for missing id', () => {
    expect(findNode(tree, '999')).toBeNull();
  });

  test('returns null for empty tree', () => {
    expect(findNode([], '1')).toBeNull();
  });
});

describe('removeNode', () => {
  const tree = [
    { id: '1', type: 'folder', name: 'A', children: [
      { id: '2', type: 'file', name: 'B' },
    ]},
    { id: '3', type: 'file', name: 'C' },
  ];

  test('removes a root node', () => {
    const result = removeNode(tree, '3');
    expect(result.find(n => n.id === '3')).toBeUndefined();
    expect(result).toHaveLength(1);
  });

  test('removes a nested node', () => {
    const result = removeNode(tree, '2');
    expect(result[0].children).toHaveLength(0);
  });

  test('leaves tree intact when id not found', () => {
    const result = removeNode(tree, '999');
    expect(result).toHaveLength(2);
  });
});

describe('updateNode', () => {
  const tree = [
    { id: '1', name: 'Old', type: 'folder', children: [
      { id: '2', name: 'Nested', type: 'file' },
    ]},
  ];

  test('updates a root node', () => {
    const result = updateNode(tree, '1', { name: 'New' });
    expect(result[0].name).toBe('New');
  });

  test('updates a nested node', () => {
    const result = updateNode(tree, '2', { name: 'Updated' });
    expect(result[0].children[0].name).toBe('Updated');
  });

  test('does not mutate the original tree', () => {
    updateNode(tree, '1', { name: 'New' });
    expect(tree[0].name).toBe('Old');
  });
});

// ─── API methods ──────────────────────────────────────────────────────────────

describe('api.getAll', () => {
  test('returns default data when localStorage is empty', async () => {
    const data = await run(() => api.getAll());
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('returns previously saved data', async () => {
    const custom = [{ id: 'x', name: 'Custom', type: 'folder', children: [] }];
    save(custom);
    const data = await run(() => api.getAll());
    expect(data[0].name).toBe('Custom');
  });
});

describe('api.createFolder', () => {
  test('creates a folder at root when parentId is null', async () => {
    await run(() => api.createFolder(null, 'NewFolder'));
    const data = await run(() => api.getAll());
    expect(data.find(n => n.name === 'NewFolder')).toBeTruthy();
  });

  test('created folder has correct shape', async () => {
    const node = await run(() => api.createFolder(null, 'TestFolder'));
    expect(node.type).toBe('folder');
    expect(node.name).toBe('TestFolder');
    expect(Array.isArray(node.children)).toBe(true);
    expect(node.id).toBeTruthy();
  });

  test('creates a folder inside an existing folder', async () => {
    // First get the tree to find a valid parentId
    const tree = await run(() => api.getAll());
    const root = tree[0]; // 'Projects' folder
    await run(() => api.createFolder(root.id, 'SubFolder'));
    const updated = await run(() => api.getAll());
    const parent = updated.find(n => n.id === root.id);
    expect(parent.children.find(n => n.name === 'SubFolder')).toBeTruthy();
  });

  test('throws when parentId does not exist', async () => {
    await expect(run(() => api.createFolder('nonexistent', 'Fail'))).rejects.toThrow();
  });
});

describe('api.rename', () => {
  test('renames a root-level node', async () => {
    const tree = await run(() => api.getAll());
    const target = tree[0];
    await run(() => api.rename(target.id, 'RenamedFolder'));
    const updated = await run(() => api.getAll());
    expect(updated.find(n => n.id === target.id)?.name).toBe('RenamedFolder');
  });

  test('renames a nested file', async () => {
    const tree = await run(() => api.getAll());
    // Find the first nested file
    const folder = tree[0];
    const nestedFile = folder.children.find(n => n.type === 'file');
    if (!nestedFile) return; // skip if structure changed
    await run(() => api.rename(nestedFile.id, 'renamed.txt'));
    const updated = await run(() => api.getAll());
    const updatedFolder = updated.find(n => n.id === folder.id);
    expect(updatedFolder.children.find(n => n.id === nestedFile.id)?.name).toBe('renamed.txt');
  });

  test('returns the new name', async () => {
    const tree = await run(() => api.getAll());
    const result = await run(() => api.rename(tree[0].id, 'ReturnTest'));
    expect(result).toBe('ReturnTest');
  });
});

describe('api.delete', () => {
  test('deletes a root-level node', async () => {
    const tree = await run(() => api.getAll());
    const target = tree[0];
    await run(() => api.delete(target.id));
    const updated = await run(() => api.getAll());
    expect(updated.find(n => n.id === target.id)).toBeUndefined();
  });

  test('deletes a nested node', async () => {
    const tree = await run(() => api.getAll());
    const folder = tree[0];
    const child = folder.children[0];
    await run(() => api.delete(child.id));
    const updated = await run(() => api.getAll());
    const updatedFolder = updated.find(n => n.id === folder.id);
    expect(updatedFolder.children.find(n => n.id === child.id)).toBeUndefined();
  });

  test('leaves rest of tree intact after delete', async () => {
    const tree = await run(() => api.getAll());
    const initialLength = tree.length;
    await run(() => api.delete(tree[0].id));
    const updated = await run(() => api.getAll());
    expect(updated).toHaveLength(initialLength - 1);
  });
});

describe('api.move', () => {
  test('moves a node to a different folder', async () => {
    const tree = await run(() => api.getAll());
    const source = tree[0];         // Projects
    const target = tree[1];         // Archives
    await run(() => api.move(source.id, target.id));
    const updated = await run(() => api.getAll());
    // Projects should be gone from root
    expect(updated.find(n => n.id === source.id)).toBeUndefined();
    // Archives should contain Projects
    const archives = updated.find(n => n.id === target.id);
    expect(archives.children.find(n => n.id === source.id)).toBeTruthy();
  });

  test('moves a node to root when targetFolderId is null', async () => {
    const tree = await run(() => api.getAll());
    const folder = tree[0];
    const child = folder.children[0];
    await run(() => api.move(child.id, null));
    const updated = await run(() => api.getAll());
    expect(updated.find(n => n.id === child.id)).toBeTruthy();
  });

  test('throws when nodeId does not exist', async () => {
    await expect(run(() => api.move('nonexistent', null))).rejects.toThrow('Node not found');
  });

  test('throws when target is not a folder', async () => {
    const tree = await run(() => api.getAll());
    const folder = tree[0];
    const file = folder.children.find(n => n.type === 'file');
    if (!file) return;
    await expect(run(() => api.move(folder.id, file.id))).rejects.toThrow('Invalid target');
  });
});

describe('api.exportJSON', () => {
  test('returns valid JSON string', () => {
    const nodes = [{ id: '1', name: 'Test', type: 'folder' }];
    const result = api.exportJSON(nodes);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test('exported JSON matches input', () => {
    const nodes = [{ id: '1', name: 'Export Me', type: 'folder', children: [] }];
    const parsed = JSON.parse(api.exportJSON(nodes));
    expect(parsed[0].name).toBe('Export Me');
  });

  test('is pretty-printed', () => {
    const nodes = [{ id: '1' }];
    const result = api.exportJSON(nodes);
    expect(result).toContain('\n');
  });
});

describe('localStorage persistence', () => {
  test('save and load round-trip', () => {
    const data = [{ id: 'abc', name: 'Persisted', type: 'folder', children: [] }];
    save(data);
    expect(load()[0].name).toBe('Persisted');
  });

  test('load returns default data when localStorage is empty', () => {
    localStorage.clear();
    const data = load();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('load returns default data when localStorage has invalid JSON', () => {
    localStorage.setItem('file_explorer_fs', 'not-json');
    const data = load();
    expect(Array.isArray(data)).toBe(true);
  });
});
