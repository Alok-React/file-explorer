import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ path, onNavigate }) {
  return (
    <nav className="breadcrumb">
      <button className="bc-item bc-home" onClick={() => onNavigate(null)}>
        <Home size={13} />
      </button>
      {path.map((node, i) => (
        <React.Fragment key={node.id}>
          <ChevronRight size={12} className="bc-sep" />
          <button
            className={`bc-item ${i === path.length - 1 ? 'active' : ''}`}
            onClick={() => onNavigate(node)}
          >
            {node.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}