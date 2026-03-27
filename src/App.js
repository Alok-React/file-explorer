import React, { useState, useEffect, useMemo } from 'react';
import { useFileSystem } from './hooks/useFileSystem';
import { useDebounce } from './hooks/useDebounce';
import { applyTheme } from './theme';
import { sortNodes, flattenSearch } from './utils/fileUtils';

import Sidebar from './components/Sidebar/FolderTree';
import Toolbar from './components/Toolbar/Toolbar';
import Breadcrumb from './components/Breadcrumb/Breadcrumb';
import FileGrid from './components/FileGrid/FileGrid';
import FileList from './components/FileList/FileList';
import GraphView from './components/GraphView/GraphView';
import FilePreview from './components/Preview/FilePreview';
import ContextMenu from './components/ContextMenu/ContextMenu';
import './App.css';

function Modal({ title, defaultValue, onConfirm, onCancel }) {
  const [value, setValue] = useState(defaultValue || '');
  return (
    <div className="preview-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <input autoFocus className="modal-input" value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirm(value)} />
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={() => onConfirm(value)}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// Find node path helper
function findPath(nodes, targetId, path = []) {
  for (const n of nodes) {
    const next = [...path, n];
    if (n.id === targetId) return next;
    if (n.children) {
      const found = findPath(n.children, targetId, next);
      if (found) return found;
    }
  }
  return null;
}

function findNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) { const f = findNode(n.children, id); if (f) return f; }
  }
  return null;
}

export default function App() {
  const fs = useFileSystem();
  const [darkMode, setDarkMode]       = useState(true);
  const [view, setView]               = useState('grid');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath]   = useState([]);
  const [sortBy, setSortBy]           = useState('name');
  const [sortDir, setSortDir]         = useState('asc');
  const [search, setSearch]           = useState('');
  const debouncedSearch               = useDebounce(search, 300);
  const [preview, setPreview]         = useState(null);
  const [ctxMenu, setCtxMenu]         = useState(null);
  const [modal, setModal]             = useState(null);

  useEffect(() => { applyTheme(darkMode ? 'dark' : 'light'); }, [darkMode]);

  const currentFolder = currentFolderId
    ? findNode(fs.tree, currentFolderId)
    : null;

  const currentNodes = useMemo(() => {
    const source = currentFolder ? (currentFolder.children || []) : fs.tree;
    if (debouncedSearch) return flattenSearch(source, debouncedSearch);
    return sortNodes(source, sortBy, sortDir);
  }, [fs.tree, currentFolder, debouncedSearch, sortBy, sortDir]);

  const navigateTo = (node) => {
    if (!node) { setCurrentFolderId(null); setFolderPath([]); return; }
    const path = findPath(fs.tree, node.id);
    setCurrentFolderId(node.id);
    setFolderPath(path || [node]);
  };

  const openNode = (node) => {
    if (node.type === 'folder') navigateTo(node);
    else setPreview(node);
  };

  const openCtx = (e, node) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleRename = () => {
    const node = ctxMenu?.node;
    if (!node) return;
    setModal({
      title: 'Rename', defaultValue: node.name,
      onConfirm: async (name) => {
        if (name && name !== node.name) await fs.rename(node.id, name);
        setModal(null);
      }
    });
  };

  const handleDelete = async () => {
    if (ctxMenu?.node) await fs.deleteNode(ctxMenu.node.id);
  };

  const handleNewFolder = (parentId) => {
    setModal({
      title: 'New Folder', defaultValue: 'Untitled Folder',
      onConfirm: async (name) => {
        if (name) await fs.createFolder(parentId ?? currentFolderId, name);
        setModal(null);
      }
    });
  };

  const handleUpload = async (files) => {
    for (const file of files) {
      await fs.uploadFile(currentFolderId, file);
    }
  };

  const handleExport = () => {
    const source = currentFolder ? (currentFolder.children || [currentFolder]) : fs.tree;
    fs.exportJSON(source);
  };

  return (
    <div className="app-shell">
      <Sidebar
        tree={fs.tree}
        selectedId={currentFolderId}
        onSelect={navigateTo}
        onCreateFolder={handleNewFolder}
      />
      <main className="main-panel">
        <Toolbar
          view={view} setView={setView}
          sortBy={sortBy} setSortBy={setSortBy}
          sortDir={sortDir} setSortDir={setSortDir}
          search={search} setSearch={setSearch}
          darkMode={darkMode} setDarkMode={setDarkMode}
          onUpload={handleUpload}
          onNewFolder={() => handleNewFolder(currentFolderId)}
          onExport={handleExport}
          currentFolder={currentFolder}
        />
        <Breadcrumb path={folderPath} onNavigate={navigateTo} />

        {fs.loading && <div className="status-bar loading">Loading...</div>}
        {fs.error   && <div className="status-bar error">Error: {fs.error}</div>}

        {!fs.loading && (
          view === 'graph'
            ? <GraphView nodes={currentNodes} onOpen={openNode} />
            : view === 'list'
            ? <FileList nodes={currentNodes} onOpen={openNode} onContextMenu={openCtx} />
            : <FileGrid nodes={currentNodes} onOpen={openNode}
                onContextMenu={openCtx} onMove={fs.move} />
        )}
      </main>

      {preview && <FilePreview file={preview} onClose={() => setPreview(null)} />}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y} node={ctxMenu.node}
          onClose={() => setCtxMenu(null)}
          onRename={handleRename}
          onDelete={handleDelete}
          onExport={() => {
            const node = ctxMenu.node;
            fs.exportJSON(node.children || [node]);
          }}
        />
      )}

      {modal && (
        <Modal {...modal} onCancel={() => setModal(null)} />
      )}
    </div>
  );
}