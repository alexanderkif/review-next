import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  getSearchParam: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
  useSearchParams: () => ({ get: mocks.getSearchParam }),
}));

vi.mock('next-auth/react', () => ({
  signIn: mocks.signIn,
}));

vi.mock('@/components/ui/OAuthButtons', () => ({
  default: () => null,
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}));

import LoginPage from '@/auth/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    mocks.getSearchParam.mockReturnValue(null);
    mocks.signIn.mockResolvedValue({ ok: true });
  });

  it('shows validation errors and does not submit invalid credentials', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it('rejects a short password before submit', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(
      await screen.findByText('Password must contain at least 6 characters'),
    ).toBeInTheDocument();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it('submits valid credentials and routes to the sanitized callback path', async () => {
    mocks.getSearchParam.mockImplementation((key: string) =>
      key === 'callbackUrl' ? 'https://attacker.example' : null,
    );
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(mocks.signIn).toHaveBeenCalledWith('credentials', {
        email: 'user@example.com',
        password: 'password123',
        redirect: false,
      });
    });
    expect(mocks.push).toHaveBeenCalledWith('/');
  });
});
