import React from 'react';
import { formatSize, getFileIcon, getFileColor } from '../../utils/fileUtils';
import { MoreVertical } from 'lucide-react';

export default function FileList({ nodes, onOpen, onContextMenu }) {
  if (!nodes.length) {
    return <div className="empty-state"><span style={{fontSize:48}}>📂</span><p>Empty folder</p></div>;
  }

  return (
    <div className="file-list">
      <div className="list-header">
        <span>Name</span><span>Type</span><span>Size</span><span>Date</span><span></span>
      </div>
      {nodes.map(node => {
        const color = getFileColor(node.fileType || 'folder');
        return (
          <div key={node.id} className="list-row"
            onDoubleClick={() => onOpen(node)}
            onContextMenu={e => onContextMenu(e, node)}>
            <span className="list-name">
              <span className="list-icon" style={{ color }}>{getFileIcon(node)}</span>
              {node.name}
            </span>
            <span className="list-type">
              {node.type === 'folder' ? 'Folder' : (node.fileType || 'file').toUpperCase()}
            </span>
            <span className="list-size">
              {node.type === 'file' ? formatSize(node.size) : '—'}
            </span>
            <span className="list-date">{node.createdAt || '—'}</span>
            <button className="icon-btn sm"
              onClick={e => { e.stopPropagation(); onContextMenu(e, node); }}>
              <MoreVertical size={13}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}