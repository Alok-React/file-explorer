import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContextMenu from '../components/ContextMenu/ContextMenu';

const fileNode   = { id: '1', name: 'Photo.png', type: 'file',   fileType: 'image', url: '/files/Photo.png' };
const folderNode = { id: '2', name: 'Projects',  type: 'folder', children: [] };

const defaultProps = {
  x: 100,
  y: 200,
  onClose:  jest.fn(),
  onRename: jest.fn(),
  onDelete: jest.fn(),
  onExport: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('ContextMenu', () => {
  test('renders the menu container', () => {
    render(<ContextMenu {...defaultProps} node={fileNode} />);
    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
  });

  test('positions the menu at x/y coordinates', () => {
    render(<ContextMenu {...defaultProps} node={fileNode} />);
    const menu = screen.getByTestId('context-menu');
    expect(menu.style.left).toBe('100px');
    expect(menu.style.top).toBe('200px');
  });

  test('always renders Rename and Delete for any node', () => {
    render(<ContextMenu {...defaultProps} node={fileNode} />);
    expect(screen.getByTestId('ctx-rename')).toBeInTheDocument();
    expect(screen.getByTestId('ctx-delete')).toBeInTheDocument();
  });

  test('renders Export JSON for folders', () => {
    render(<ContextMenu {...defaultProps} node={folderNode} />);
    expect(screen.getByTestId('ctx-export')).toBeInTheDocument();
  });

  test('does not render Export JSON for files', () => {
    render(<ContextMenu {...defaultProps} node={fileNode} />);
    expect(screen.queryByTestId('ctx-export')).toBeNull();
  });

  test('renders Download for files with a url', () => {
    render(<ContextMenu {...defaultProps} node={fileNode} />);
    expect(screen.getByTestId('ctx-download')).toBeInTheDocument();
  });

  test('does not render Download for folders', () => {
    render(<ContextMenu {...defaultProps} node={folderNode} />);
    expect(screen.queryByTestId('ctx-download')).toBeNull();
  });

  test('calls onRename and onClose when Rename is clicked', () => {
    const onRename = jest.fn();
    const onClose  = jest.fn();
    render(<ContextMenu {...defaultProps} node={fileNode} onRename={onRename} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('ctx-rename'));
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onDelete and onClose when Delete is clicked', () => {
    const onDelete = jest.fn();
    const onClose  = jest.fn();
    render(<ContextMenu {...defaultProps} node={fileNode} onDelete={onDelete} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('ctx-delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onExport and onClose when Export JSON is clicked', () => {
    const onExport = jest.fn();
    const onClose  = jest.fn();
    render(<ContextMenu {...defaultProps} node={folderNode} onExport={onExport} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('ctx-export'));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Delete button has danger class', () => {
    render(<ContextMenu {...defaultProps} node={fileNode} />);
    expect(screen.getByTestId('ctx-delete')).toHaveClass('danger');
  });

  test('Rename button does not have danger class', () => {
    render(<ContextMenu {...defaultProps} node={fileNode} />);
    expect(screen.getByTestId('ctx-rename')).not.toHaveClass('danger');
  });

  test('calls onClose when clicking outside the menu', () => {
    const onClose = jest.fn();
    render(
      <div>
        <ContextMenu {...defaultProps} node={fileNode} onClose={onClose} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(onClose).toHaveBeenCalled();
  });

  test('does not call onClose when clicking inside the menu', () => {
    const onClose = jest.fn();
    render(<ContextMenu {...defaultProps} node={fileNode} onClose={onClose} />);
    fireEvent.mouseDown(screen.getByTestId('context-menu'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
