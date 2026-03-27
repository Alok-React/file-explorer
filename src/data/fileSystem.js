import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'file_explorer_fs';

const defaultData = [
  {
    id: "1", name: "Projects", type: "folder",
    children: [
      {
        id: "2", name: "Designs", type: "folder",
        children: [
          { id: "3", name: "LandingPage.png", type: "file", fileType: "image",
            url: "https://picsum.photos/seed/landing/800/600", size: 204800, createdAt: "2024-01-15" },
          { id: "4", name: "Wireframe.pdf", type: "file", fileType: "pdf",
            url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2.pdf", size: 512000, createdAt: "2024-01-18" },
        ]
      },
      {
        id: "5", name: "Videos", type: "folder",
        children: [
          { id: "6", name: "Demo.mp4", type: "file", fileType: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4", size: 1048576, createdAt: "2024-02-01" },
        ]
      },
      { id: "7", name: "README.txt", type: "file", fileType: "other",
        url: "#", size: 1024, createdAt: "2024-01-10" },
    ]
  },
  {
    id: "8", name: "Archives", type: "folder",
    children: [
      { id: "9", name: "OldProject.zip", type: "file", fileType: "other",
        url: "#", size: 2097152, createdAt: "2023-12-05" },
    ]
  }
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultData;
  } catch { return defaultData; }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Simulate async API delay
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// --- Helpers ---
function findNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeNode(nodes, id) {
  return nodes
    .filter(n => n.id !== id)
    .map(n => n.children ? { ...n, children: removeNode(n.children, id) } : n);
}

function updateNode(nodes, id, patch) {
  return nodes.map(n => {
    if (n.id === id) return { ...n, ...patch };
    if (n.children) return { ...n, children: updateNode(n.children, id, patch) };
    return n;
  });
}

// --- Mock API ---
export const api = {
  async getAll() {
    await delay();
    return load();
  },

  async createFolder(parentId, name) {
    await delay();
    const data = load();
    const node = { id: uuid(), name, type: 'folder', children: [], createdAt: new Date().toISOString().split('T')[0] };
    if (!parentId) { data.push(node); save(data); return node; }
    const parent = findNode(data, parentId);
    if (!parent || parent.type !== 'folder') throw new Error('Invalid parent');
    parent.children = parent.children || [];
    parent.children.push(node);
    save(data);
    return node;
  },

  async uploadFile(parentId, fileObj) {
    await delay(500);
    const data = load();
    const ext = fileObj.name.split('.').pop().toLowerCase();
    const fileTypeMap = { png:'image', jpg:'image', jpeg:'image', webp:'image',
      mp4:'video', webm:'video', pdf:'pdf', gif:'image' };
    const node = {
      id: uuid(), name: fileObj.name, type: 'file',
      fileType: fileTypeMap[ext] || 'other',
      url: URL.createObjectURL(fileObj),
      size: fileObj.size,
      createdAt: new Date().toISOString().split('T')[0],
      mimeType: fileObj.type,
    };
    if (!parentId) { data.push(node); save(data); return node; }
    const parent = findNode(data, parentId);
    if (!parent) throw new Error('Parent not found');
    parent.children.push(node);
    save(data);
    return node;
  },

  async rename(id, newName) {
    await delay();
    const data = load();
    const updated = updateNode(data, id, { name: newName });
    save(updated);
    return newName;
  },

  async delete(id) {
    await delay();
    const data = load();
    save(removeNode(data, id));
  },

  async move(nodeId, targetFolderId) {
    await delay();
    const data = load();
    const node = findNode(data, nodeId);
    if (!node) throw new Error('Node not found');
    const cleaned = removeNode(data, nodeId);
    if (!targetFolderId) { cleaned.push(node); save(cleaned); return; }
    const target = findNode(cleaned, targetFolderId);
    if (!target || target.type !== 'folder') throw new Error('Invalid target');
    target.children = target.children || [];
    target.children.push(node);
    save(cleaned);
  },

  exportJSON(nodes) {
    return JSON.stringify(nodes, null, 2);
  }
};