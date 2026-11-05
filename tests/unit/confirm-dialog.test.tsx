import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders an accessible dialog with title, description and named actions', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Delete project"
        message="This cannot be undone"
        cancelText="Keep"
        confirmText="Delete"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Delete project' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    expect(screen.getByText('This cannot be undone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls confirm after the closing transition', () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="Confirm"
        message="Proceed?"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls cancel when the close button is pressed', () => {
    vi.useFakeTimers();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="Confirm"
        message="Proceed?"
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    act(() => vi.advanceTimersByTime(200));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
