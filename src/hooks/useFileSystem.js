import { useState, useEffect, useCallback } from 'react';
import { api } from '../data/fileSystem';

export function useFileSystem() {
  const [tree, setTree]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAll();
      setTree(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createFolder = async (parentId, name) => {
    const node = await api.createFolder(parentId, name);
    await refresh();
    return node;
  };

  const uploadFile = async (parentId, file) => {
    const node = await api.uploadFile(parentId, file);
    await refresh();
    return node;
  };

  const rename = async (id, newName) => {
    await api.rename(id, newName);
    await refresh();
  };

  const deleteNode = async (id) => {
    await api.delete(id);
    await refresh();
  };

  const move = async (nodeId, targetId) => {
    // Optimistic update
    await api.move(nodeId, targetId);
    await refresh();
  };

  const exportJSON = (nodes) => {
    const json = api.exportJSON(nodes);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'filesystem.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return { tree, loading, error, refresh, createFolder, uploadFile, rename, deleteNode, move, exportJSON };
}