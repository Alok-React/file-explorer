import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileGrid from '../components/FileGrid/FileGrid';

const folder = { id: '1', name: 'Projects', type: 'folder', children: [] };
const image  = { id: '2', name: 'Photo.png', type: 'file', fileType: 'image', size: 204800 };
const video  = { id: '3', name: 'Demo.mp4',  type: 'file', fileType: 'video', size: 1048576 };

describe('FileGrid', () => {
  test('renders the empty state when nodes is empty', () => {
    render(<FileGrid nodes={[]} onOpen={jest.fn()} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  test('renders cards for each node', () => {
    render(<FileGrid nodes={[folder, image]} onOpen={jest.fn()} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByTestId('file-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('file-card-2')).toBeInTheDocument();
  });

  test('displays node names', () => {
    render(<FileGrid nodes={[folder, image]} onOpen={jest.fn()} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Photo.png')).toBeInTheDocument();
  });

  test('shows item count for folders', () => {
    render(<FileGrid nodes={[folder]} onOpen={jest.fn()} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  test('shows formatted size for files', () => {
    render(<FileGrid nodes={[image]} onOpen={jest.fn()} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByText('200.0 KB')).toBeInTheDocument();
  });

  test('calls onOpen with the node on double-click', () => {
    const onOpen = jest.fn();
    render(<FileGrid nodes={[folder]} onOpen={onOpen} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    fireEvent.doubleClick(screen.getByTestId('file-card-1'));
    expect(onOpen).toHaveBeenCalledWith(folder);
  });

  test('calls onContextMenu on right-click', () => {
    const onContextMenu = jest.fn();
    render(<FileGrid nodes={[image]} onOpen={jest.fn()} onContextMenu={onContextMenu} onMove={jest.fn()} />);
    fireEvent.contextMenu(screen.getByTestId('file-card-2'));
    expect(onContextMenu).toHaveBeenCalled();
  });

  test('calls onContextMenu when more button is clicked', () => {
    const onContextMenu = jest.fn();
    render(<FileGrid nodes={[image]} onOpen={jest.fn()} onContextMenu={onContextMenu} onMove={jest.fn()} />);
    fireEvent.click(screen.getByLabelText('More options'));
    expect(onContextMenu).toHaveBeenCalled();
  });

  test('renders the file grid container', () => {
    render(<FileGrid nodes={[folder]} onOpen={jest.fn()} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByTestId('file-grid')).toBeInTheDocument();
  });

  test('renders multiple file types', () => {
    render(<FileGrid nodes={[folder, image, video]} onOpen={jest.fn()} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Photo.png')).toBeInTheDocument();
    expect(screen.getByText('Demo.mp4')).toBeInTheDocument();
  });

  test('does not call onOpen on single click', () => {
    const onOpen = jest.fn();
    render(<FileGrid nodes={[folder]} onOpen={onOpen} onContextMenu={jest.fn()} onMove={jest.fn()} />);
    fireEvent.click(screen.getByTestId('file-card-1'));
    expect(onOpen).not.toHaveBeenCalled();
  });
});
