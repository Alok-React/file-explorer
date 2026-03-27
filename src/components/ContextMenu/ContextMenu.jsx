import React, { useEffect, useRef } from 'react';
import { Pencil, Trash2, Download, FolderPlus, Info } from 'lucide-react';

export default function ContextMenu({ x, y, node, onClose, onRename, onDelete, onExport }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items = [
    { icon: <Pencil size={13}/>, label: 'Rename', action: onRename },
    { icon: <Trash2 size={13}/>, label: 'Delete', action: onDelete, danger: true },
    node?.type === 'folder' && { icon: <FolderPlus size={13}/>, label: 'Export JSON', action: onExport },
    node?.url && node.type === 'file' && {
      icon: <Download size={13}/>, label: 'Download',
      action: () => { const a = document.createElement('a'); a.href = node.url; a.download = node.name; a.click(); }
    },
  ].filter(Boolean);

  return (
    <div ref={ref} className="context-menu"
      style={{ left: x, top: y }}>
      {items.map((item, i) => (
        <button key={i}
          className={`ctx-item ${item.danger ? 'danger' : ''}`}
          onClick={() => { item.action(); onClose(); }}>
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
}