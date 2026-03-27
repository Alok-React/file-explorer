import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { formatSize } from '../../utils/fileUtils';

export default function FilePreview({ file, onClose }) {
  if (!file) return null;

  const renderContent = () => {
    switch (file.fileType) {
      case 'image':
        return (
          <div className="preview-image-wrap">
            <img src={file.url} alt={file.name}
              style={{ maxWidth:'100%', maxHeight:'60vh', objectFit:'contain', borderRadius:8 }} />
          </div>
        );
      case 'video':
        return (
          <video controls style={{ width:'100%', borderRadius:8, background:'#000' }}>
            <source src={file.url} />
            Your browser does not support video.
          </video>
        );
      case 'pdf':
        return (
          <iframe src={file.url} title={file.name}
            style={{ width:'100%', height:'60vh', border:'none', borderRadius:8 }} />
        );
      default:
        return (
          <div className="preview-unsupported">
            <FileText size={48} style={{ opacity:0.3 }} />
            <p>Preview not available</p>
            <small>Download to open this file</small>
          </div>
        );
    }
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-panel" onClick={e => e.stopPropagation()}>
        <div className="preview-header">
          <div>
            <h3>{file.name}</h3>
            <small style={{ color:'var(--text-secondary)' }}>
              {(file.fileType || 'file').toUpperCase()} · {formatSize(file.size)}
              {file.createdAt && ` · ${file.createdAt}`}
            </small>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <a href={file.url} download={file.name} className="btn-secondary" style={{ textDecoration:'none' }}>
              <Download size={14}/> Download
            </a>
            <button className="icon-btn" onClick={onClose}><X size={16}/></button>
          </div>
        </div>
        <div className="preview-body">{renderContent()}</div>
      </div>
    </div>
  );
}