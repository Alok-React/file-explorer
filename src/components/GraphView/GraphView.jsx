import React, { useEffect, useRef } from 'react';

function buildGraph(nodes, parentX = 0, parentY = 0, level = 0, index = 0, totalSiblings = 1) {
  const vertices = [];
  const edges = [];
  const xSpacing = 180;
  const ySpacing = 90;
  const x = parentX + index * xSpacing - ((totalSiblings - 1) * xSpacing) / 2;
  const y = level * ySpacing + 60;

  nodes.forEach((node, i) => {
    vertices.push({ ...node, x, y, level, index: i });
    if (parentX !== 0 || parentY !== 0) {
      edges.push({ x1: parentX, y1: parentY, x2: x, y2: y });
    }
    if (node.children?.length) {
      const { vertices: cv, edges: ce } = buildGraph(
        node.children, x, y, level + 1, i, node.children.length
      );
      vertices.push(...cv);
      edges.push(...ce);
    }
  });
  return { vertices, edges };
}

export default function GraphView({ nodes, onOpen }) {
  const { vertices, edges } = buildGraph(nodes, 0, 0, 0);

  const minX = Math.min(...vertices.map(v => v.x)) - 80;
  const maxX = Math.max(...vertices.map(v => v.x)) + 80;
  const maxY = Math.max(...vertices.map(v => v.y)) + 80;
  const width = Math.max(800, maxX - minX);
  const height = Math.max(400, maxY);

  return (
    <div className="graph-view" style={{ overflow:'auto' }}>
      <svg width={width} height={height} style={{ minWidth: '100%' }}>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6"
            refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--border)" />
          </marker>
        </defs>
        {edges.map((e, i) => (
          <line key={i}
            x1={e.x1 - minX} y1={e.y1} x2={e.x2 - minX} y2={e.y2}
            stroke="var(--border)" strokeWidth={1.5}
            markerEnd="url(#arrow)" />
        ))}
        {vertices.map(v => (
          <g key={v.id}
            transform={`translate(${v.x - minX},${v.y})`}
            style={{ cursor:'pointer' }}
            onDoubleClick={() => onOpen(v)}>
            <rect x={-50} y={-18} width={100} height={36} rx={8}
              fill={v.type === 'folder' ? 'var(--accent-muted)' : 'var(--bg-elevated)'}
              stroke={v.type === 'folder' ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={1.5} />
            <text textAnchor="middle" y={5} fontSize={11}
              fill="var(--text-primary)" fontFamily="monospace">
              {v.name.length > 12 ? v.name.slice(0, 11) + '…' : v.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}