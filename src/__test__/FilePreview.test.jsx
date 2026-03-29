import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilePreview from '../components/Preview/FilePreview';

const imageFile = { id: '1', name: 'Photo.png',   type: 'file', fileType: 'image', url: '/files/Photo.png', size: 204800, createdAt: '2024-01-15' };
const videoFile = { id: '2', name: 'Demo.mp4',    type: 'file', fileType: 'video', url: '/files/Demo.mp4',  size: 1048576, createdAt: '2024-02-01' };
const pdfFile   = { id: '3', name: 'Report.pdf',  type: 'file', fileType: 'pdf',   url: '/files/Report.pdf', size: 512000, createdAt: '2024-01-20' };
const otherFile = { id: '4', name: 'Archive.zip', type: 'file', fileType: 'other', url: '/files/Archive.zip', size: 2097152, createdAt: '2024-03-01' };

describe('FilePreview', () => {
  test('renders nothing when file is null', () => {
    const { container } = render(<FilePreview file={null} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the overlay when a file is provided', () => {
    render(<FilePreview file={imageFile} onClose={jest.fn()} />);
    expect(screen.getByTestId('preview-overlay')).toBeInTheDocument();
  });

  test('renders the panel inside the overlay', () => {
    render(<FilePreview file={imageFile} onClose={jest.fn()} />);
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
  });

  test('displays the file name', () => {
    render(<FilePreview file={imageFile} onClose={jest.fn()} />);
    expect(screen.getByText('Photo.png')).toBeInTheDocument();
  });

  test('displays the file type uppercase', () => {
    render(<FilePreview file={pdfFile} onClose={jest.fn()} />);
    expect(screen.getByText(/PDF/)).toBeInTheDocument();
  });

  test('displays formatted file size', () => {
    render(<FilePreview file={imageFile} onClose={jest.fn()} />);
    expect(screen.getByText(/200\.0 KB/)).toBeInTheDocument();
  });

  test('displays creation date', () => {
    render(<FilePreview file={imageFile} onClose={jest.fn()} />);
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument();
  });

  // ── Image preview ────────────────────────────────────────────────────────

  test('renders an img element for image files', () => {
    render(<FilePreview file={imageFile} onClose={jest.fn()} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/files/Photo.png');
    expect(img).toHaveAttribute('alt', 'Photo.png');
  });

  // ── Video preview ────────────────────────────────────────────────────────

  test('renders a video element for video files', () => {
    render(<FilePreview file={videoFile} onClose={jest.fn()} />);
    expect(screen.getByTestId('preview-video')).toBeInTheDocument();
  });

  test('video element has controls attribute', () => {
    render(<FilePreview file={videoFile} onClose={jest.fn()} />);
    expect(screen.getByTestId('preview-video')).toHaveAttribute('controls');
  });

  // ── PDF preview ──────────────────────────────────────────────────────────

  test('renders an iframe for PDF files', () => {
    render(<FilePreview file={pdfFile} onClose={jest.fn()} />);
    expect(screen.getByTestId('preview-iframe')).toBeInTheDocument();
  });

  test('iframe src matches file url', () => {
    render(<FilePreview file={pdfFile} onClose={jest.fn()} />);
    expect(screen.getByTestId('preview-iframe')).toHaveAttribute('src', '/files/Report.pdf');
  });

  // ── Unsupported preview ──────────────────────────────────────────────────

  test('renders unsupported state for other file types', () => {
    render(<FilePreview file={otherFile} onClose={jest.fn()} />);
    expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument();
    expect(screen.getByText('Preview not available')).toBeInTheDocument();
  });

  // ── Close behaviour ──────────────────────────────────────────────────────

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<FilePreview file={imageFile} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('preview-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when overlay backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<FilePreview file={imageFile} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('preview-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when panel content is clicked', () => {
    const onClose = jest.fn();
    render(<FilePreview file={imageFile} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('preview-panel'));
    expect(onClose).not.toHaveBeenCalled();
  });

  // ── Download link ────────────────────────────────────────────────────────

  test('renders a download link', () => {
    render(<FilePreview file={imageFile} onClose={jest.fn()} />);
    const link = screen.getByRole('link', { name: /download/i });
    expect(link).toHaveAttribute('href', '/files/Photo.png');
    expect(link).toHaveAttribute('download', 'Photo.png');
  });
});
