import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  push: vi.fn(),
  usePathname: vi.fn(),
  toggleProjectLike: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: mocks.useSession,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: mocks.usePathname,
}));

vi.mock('@/lib/actions', () => ({
  toggleProjectLike: mocks.toggleProjectLike,
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}));

vi.mock('@/components/ui/Tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

import ProjectCardLikeButton from '@/components/ProjectCardLikeButton';

describe('ProjectCardLikeButton', () => {
  beforeEach(() => {
    mocks.useSession.mockReturnValue({ data: { user: { id: '7' } } });
    mocks.usePathname.mockReturnValue('/projects/12');
    mocks.toggleProjectLike.mockResolvedValue({ success: true });
  });

  it('sends guests to login with a callback to the current page', () => {
    mocks.useSession.mockReturnValue({ data: null });
    render(<ProjectCardLikeButton projectId={12} initialLiked={false} initialCount={4} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mocks.push).toHaveBeenCalledWith('/auth/login?callbackUrl=%2Fprojects%2F12');
    expect(mocks.toggleProjectLike).not.toHaveBeenCalled();
  });

  it('optimistically adds and removes a like', async () => {
    const { rerender } = render(
      <ProjectCardLikeButton projectId={12} initialLiked={false} initialCount={4} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('5')).toBeInTheDocument();
    expect(mocks.toggleProjectLike).toHaveBeenCalledWith(12);

    rerender(<ProjectCardLikeButton projectId={12} initialLiked={true} initialCount={5} />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('4')).toBeInTheDocument();
  });

  it('reverts the optimistic state if the action reports failure', async () => {
    mocks.toggleProjectLike.mockResolvedValueOnce({ success: false });
    render(<ProjectCardLikeButton projectId={12} initialLiked={false} initialCount={4} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('reverts the optimistic state if the action throws', async () => {
    mocks.toggleProjectLike.mockRejectedValueOnce(new Error('Network failure'));
    render(<ProjectCardLikeButton projectId={12} initialLiked={false} initialCount={4} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('disables the control while a like request is pending', async () => {
    let resolveLike!: (result: { success: boolean }) => void;
    mocks.toggleProjectLike.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLike = resolve;
      }),
    );
    render(<ProjectCardLikeButton projectId={12} initialLiked={false} initialCount={4} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toBeDisabled();
    resolveLike({ success: true });
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
  });
});
