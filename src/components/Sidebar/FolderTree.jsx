import React, { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Plus } from 'lucide-react';

function TreeNode({ node, selectedId, onSelect, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children?.some(c => c.type === 'folder');

  if (node.type !== 'folder') return null;

  return (
    <div>
      <div
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${16 + depth * 14}px` }}
        onClick={() => { setOpen(o => !o); onSelect(node); }}
      >
        {hasChildren
          ? <ChevronRight size={12} className={`chevron ${open ? 'open' : ''}`} />
          : <span style={{ width: 12 }} />}
        {open ? <FolderOpen size={14} /> : <Folder size={14} />}
        <span className="tree-label">{node.name}</span>
      </div>
      {open && hasChildren && (
        <div className="tree-children">
          {node.children.filter(c => c.type === 'folder').map(child => (
            <TreeNode key={child.id} node={child}
              selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ tree, selectedId, onSelect, onCreateFolder }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Files</span>
        <button className="icon-btn" onClick={() => onCreateFolder(null)} title="New Folder">
          <Plus size={14} />
        </button>
      </div>
      <div className="tree-root">
        {tree.map(node => (
          <TreeNode key={node.id} node={node}
            selectedId={selectedId} onSelect={onSelect} />
        ))}
      </div>
    </aside>
  );
}