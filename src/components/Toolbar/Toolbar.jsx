import React from 'react';
import {
  LayoutGrid, List, GitBranch, Upload, FolderPlus,
  Search, SortAsc, Download, Sun, Moon
} from 'lucide-react';

export default function Toolbar({
  view, setView, sortBy, setSortBy, sortDir, setSortDir,
  search, setSearch, darkMode, setDarkMode,
  onUpload, onNewFolder, onExport, currentFolder
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="search-box">
          <Search size={14} />
          <input
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="toolbar-right">
        <div className="btn-group">
          {['grid','list','graph'].map(v => (
            <button key={v} className={`icon-btn ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)} title={v}>
              {v === 'grid' ? <LayoutGrid size={15}/> :
               v === 'list' ? <List size={15}/> :
               <GitBranch size={15}/>}
            </button>
          ))}
        </div>

        <select className="sort-select"
          value={`${sortBy}-${sortDir}`}
          onChange={e => {
            const [by, dir] = e.target.value.split('-');
            setSortBy(by); setSortDir(dir);
          }}>
          <option value="name-asc">Name ↑</option>
          <option value="name-desc">Name ↓</option>
          <option value="size-asc">Size ↑</option>
          <option value="size-desc">Size ↓</option>
          <option value="date-desc">Newest</option>
          <option value="date-asc">Oldest</option>
        </select>

        <button className="btn-secondary" onClick={onNewFolder}>
          <FolderPlus size={14}/> New Folder
        </button>

        <label className="btn-secondary" style={{cursor:'pointer'}}>
          <Upload size={14}/> Upload
          <input type="file" multiple hidden
            onChange={e => onUpload(Array.from(e.target.files))} />
        </label>

        <button className="btn-secondary" onClick={onExport} title="Export JSON">
          <Download size={14}/> Export
        </button>

        <button className="icon-btn" onClick={() => setDarkMode(d => !d)}>
          {darkMode ? <Sun size={15}/> : <Moon size={15}/>}
        </button>
      </div>
    </div>
  );
}