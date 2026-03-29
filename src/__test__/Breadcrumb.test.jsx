import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

const folder1 = { id: '1', name: 'Projects', type: 'folder' };
const folder2 = { id: '2', name: 'Designs',  type: 'folder' };

describe('Breadcrumb', () => {
  test('renders the home button', () => {
    render(<Breadcrumb path={[]} onNavigate={jest.fn()} />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });

  test('renders nothing extra when path is empty', () => {
    render(<Breadcrumb path={[]} onNavigate={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Projects' })).toBeNull();
  });

  test('renders one segment for a single-level path', () => {
    render(<Breadcrumb path={[folder1]} onNavigate={jest.fn()} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('renders all segments for a multi-level path', () => {
    render(<Breadcrumb path={[folder1, folder2]} onNavigate={jest.fn()} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Designs')).toBeInTheDocument();
  });

  test('last segment has active class', () => {
    render(<Breadcrumb path={[folder1, folder2]} onNavigate={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    // buttons: Home, Projects, Designs (Designs is last → active)
    const designsBtn = buttons.find(b => b.textContent === 'Designs');
    expect(designsBtn).toHaveClass('active');
  });

  test('non-last segments do not have active class', () => {
    render(<Breadcrumb path={[folder1, folder2]} onNavigate={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    const projectsBtn = buttons.find(b => b.textContent === 'Projects');
    expect(projectsBtn).not.toHaveClass('active');
  });

  test('clicking home calls onNavigate with null', () => {
    const onNavigate = jest.fn();
    render(<Breadcrumb path={[folder1]} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByLabelText('Home'));
    expect(onNavigate).toHaveBeenCalledWith(null);
  });

  test('clicking a segment calls onNavigate with that node', () => {
    const onNavigate = jest.fn();
    render(<Breadcrumb path={[folder1, folder2]} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Projects'));
    expect(onNavigate).toHaveBeenCalledWith(folder1);
  });

  test('clicking the last segment calls onNavigate with that node', () => {
    const onNavigate = jest.fn();
    render(<Breadcrumb path={[folder1, folder2]} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Designs'));
    expect(onNavigate).toHaveBeenCalledWith(folder2);
  });
});
