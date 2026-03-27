import React from 'react';
import { formatSize, getFileIcon, getFileColor } from '../../utils/fileUtils';
import { MoreVertical } from 'lucide-react';

function FileCard({ node, onOpen, onContextMenu, onDragStart, onDrop, onDragOver }) {
  const color = getFileColor(node.fileType || 'folder');
  return (
    <div
      className="file-card"
      draggable
      onDragStart={e => onDragStart(e, node)}
      onDrop={e => onDrop(e, node)}
      onDragOver={onDragOver}
      onDoubleClick={() => onOpen(node)}
      onContextMenu={e => onContextMenu(e, node)}
    >
      <div className="card-icon" style={{ background: `${color}18`, color }}>
        <span className="icon-emoji">{getFileIcon(node)}</span>
      </div>
      <div className="card-info">
        <span className="card-name" title={node.name}>{node.name}</span>
        <span className="card-meta">
          {node.type === 'folder'
            ? `${node.children?.length || 0} items`
            : formatSize(node.size)}
        </span>
      </div>
      <button className="card-more" onClick={e => { e.stopPropagation(); onContextMenu(e, node); }}>
        <MoreVertical size={13}/>
      </button>
    </div>
  );
}

export default function FileGrid({ nodes, onOpen, onContextMenu, onMove }) {
  const [dragging, setDragging] = React.useState(null);

  const handleDragStart = (e, node) => {
    setDragging(node);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (dragging && target.type === 'folder' && dragging.id !== target.id) {
      onMove(dragging.id, target.id);
    }
    setDragging(null);
  };

  if (!nodes.length) {
    return (
      <div className="empty-state">
        <span style={{fontSize:48}}>📂</span>
        <p>This folder is empty</p>
        <small>Upload files or create a new folder</small>
      </div>
    );
  }

  return (
    <div className="file-grid">
      {nodes.map(node => (
        <FileCard key={node.id} node={node}
          onOpen={onOpen}
          onContextMenu={onContextMenu}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        />
      ))}
    </div>
  );
}