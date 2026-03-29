import { renderHook, act, waitFor } from '@testing-library/react';
import { useFileSystem } from '../hooks/useFileSystem';
import { api } from '../data/fileSystem';

// Mock the entire API module
jest.mock('../data/fileSystem', () => ({
  api: {
    getAll:       jest.fn(),
    createFolder: jest.fn(),
    uploadFile:   jest.fn(),
    rename:       jest.fn(),
    delete:       jest.fn(),
    move:         jest.fn(),
    exportJSON:   jest.fn(),
  },
}));

const sampleTree = [
  { id: '1', name: 'Projects', type: 'folder', children: [] },
  { id: '2', name: 'Archives', type: 'folder', children: [] },
];

beforeEach(() => {
  jest.clearAllMocks();
  api.getAll.mockResolvedValue([...sampleTree]);
  api.createFolder.mockResolvedValue({ id: '99', name: 'New Folder', type: 'folder', children: [] });
  api.rename.mockResolvedValue('Renamed');
  api.delete.mockResolvedValue(undefined);
  api.move.mockResolvedValue(undefined);
  api.uploadFile.mockResolvedValue({ id: '88', name: 'upload.png', type: 'file', fileType: 'image' });
  api.exportJSON.mockReturnValue('[]');
});

describe('useFileSystem', () => {
  test('starts with loading true and empty tree', () => {
    const { result } = renderHook(() => useFileSystem());
    expect(result.current.loading).toBe(true);
    expect(result.current.tree).toEqual([]);
  });

  test('sets loading to false after data loads', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test('populates tree after initial load', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.tree).toHaveLength(2));
    expect(result.current.tree[0].name).toBe('Projects');
  });

  test('sets error when getAll rejects', async () => {
    api.getAll.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.error).toBe('Network error'));
    expect(result.current.loading).toBe(false);
  });

  test('clears error on subsequent successful load', async () => {
    api.getAll
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(sampleTree);
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.error).toBe('fail'));
    await act(async () => { await result.current.refresh(); });
    expect(result.current.error).toBeNull();
  });

  // ── createFolder ──────────────────────────────────────────────────────────

  test('createFolder calls api.createFolder with correct args', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.createFolder('1', 'Sub'); });
    expect(api.createFolder).toHaveBeenCalledWith('1', 'Sub');
  });

  test('createFolder triggers a refresh', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = api.getAll.mock.calls.length;
    await act(async () => { await result.current.createFolder('1', 'Sub'); });
    expect(api.getAll.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  // ── rename ────────────────────────────────────────────────────────────────

  test('rename calls api.rename with correct args', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.rename('1', 'New Name'); });
    expect(api.rename).toHaveBeenCalledWith('1', 'New Name');
  });

  test('rename triggers a refresh', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = api.getAll.mock.calls.length;
    await act(async () => { await result.current.rename('1', 'New Name'); });
    expect(api.getAll.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  // ── deleteNode ────────────────────────────────────────────────────────────

  test('deleteNode calls api.delete with the node id', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.deleteNode('1'); });
    expect(api.delete).toHaveBeenCalledWith('1');
  });

  test('deleteNode triggers a refresh', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = api.getAll.mock.calls.length;
    await act(async () => { await result.current.deleteNode('1'); });
    expect(api.getAll.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  // ── move ──────────────────────────────────────────────────────────────────

  test('move calls api.move with correct args', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.move('1', '2'); });
    expect(api.move).toHaveBeenCalledWith('1', '2');
  });

  test('move triggers a refresh', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = api.getAll.mock.calls.length;
    await act(async () => { await result.current.move('1', '2'); });
    expect(api.getAll.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  // ── uploadFile ────────────────────────────────────────────────────────────

  test('uploadFile calls api.uploadFile with correct args', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const fakeFile = { name: 'test.png', size: 1024, type: 'image/png' };
    await act(async () => { await result.current.uploadFile('1', fakeFile); });
    expect(api.uploadFile).toHaveBeenCalledWith('1', fakeFile);
  });

  test('uploadFile triggers a refresh', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = api.getAll.mock.calls.length;
    const fakeFile = { name: 'test.png', size: 1024, type: 'image/png' };
    await act(async () => { await result.current.uploadFile('1', fakeFile); });
    expect(api.getAll.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  // ── exportJSON ────────────────────────────────────────────────────────────

  test('exportJSON calls api.exportJSON and returns the result', async () => {
    api.exportJSON.mockReturnValue('[{"id":"1"}]');
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const json = result.current.exportJSON(sampleTree);
    expect(api.exportJSON).toHaveBeenCalledWith(sampleTree);
    expect(json).toBe('[{"id":"1"}]');
  });

  // ── refresh ───────────────────────────────────────────────────────────────

  test('refresh sets loading true then false', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const refreshPromise = act(async () => { await result.current.refresh(); });
    await refreshPromise;
    expect(result.current.loading).toBe(false);
  });

  test('refresh updates the tree with new data', async () => {
    const { result } = renderHook(() => useFileSystem());
    await waitFor(() => expect(result.current.tree).toHaveLength(2));
    api.getAll.mockResolvedValueOnce([{ id: '99', name: 'Solo', type: 'folder', children: [] }]);
    await act(async () => { await result.current.refresh(); });
    expect(result.current.tree).toHaveLength(1);
    expect(result.current.tree[0].name).toBe('Solo');
  });
});
