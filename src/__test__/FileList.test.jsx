import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileList from '../components/FileList/FileList';

const folder = { id: '1', name: 'Projects', type: 'folder', children: [], createdAt: '2024-01-01' };
const file   = { id: '2', name: 'Report.pdf', type: 'file', fileType: 'pdf', size: 512000, createdAt: '2024-02-15' };
const other  = { id: '3', name: 'Archive.zip', type: 'file', fileType: 'other', size: 2097152, createdAt: '2024-03-01' };

describe('FileList', () => {
  test('renders empty state when nodes is empty', () => {
    render(<FileList nodes={[]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  test('renders the list container', () => {
    render(<FileList nodes={[file]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByTestId('file-list')).toBeInTheDocument();
  });

  test('renders a row per node', () => {
    render(<FileList nodes={[folder, file]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByTestId('list-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('list-row-2')).toBeInTheDocument();
  });

  test('displays node names', () => {
    render(<FileList nodes={[folder, file]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Report.pdf')).toBeInTheDocument();
  });

  test('displays "Folder" type label for folders', () => {
    render(<FileList nodes={[folder]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByText('Folder')).toBeInTheDocument();
  });

  test('displays uppercased fileType label for files', () => {
    render(<FileList nodes={[file]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  test('displays formatted size for files', () => {
    render(<FileList nodes={[file]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByText('500.0 KB')).toBeInTheDocument();
  });

  test('displays em dash for folder size', () => {
    render(<FileList nodes={[folder]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('displays creation date', () => {
    render(<FileList nodes={[file]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByText('2024-02-15')).toBeInTheDocument();
  });

  test('calls onOpen with node on double-click', () => {
    const onOpen = jest.fn();
    render(<FileList nodes={[file]} onOpen={onOpen} onContextMenu={jest.fn()} />);
    fireEvent.doubleClick(screen.getByTestId('list-row-2'));
    expect(onOpen).toHaveBeenCalledWith(file);
  });

  test('calls onContextMenu on right-click', () => {
    const onContextMenu = jest.fn();
    render(<FileList nodes={[file]} onOpen={jest.fn()} onContextMenu={onContextMenu} />);
    fireEvent.contextMenu(screen.getByTestId('list-row-2'));
    expect(onContextMenu).toHaveBeenCalled();
  });

  test('calls onContextMenu via more button', () => {
    const onContextMenu = jest.fn();
    render(<FileList nodes={[file]} onOpen={jest.fn()} onContextMenu={onContextMenu} />);
    fireEvent.click(screen.getByLabelText('More options'));
    expect(onContextMenu).toHaveBeenCalled();
  });

  test('renders header row', () => {
    render(<FileList nodes={[file]} onOpen={jest.fn()} onContextMenu={jest.fn()} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
  });
});
