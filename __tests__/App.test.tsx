import React from 'react';
import { render, screen } from '@testing-library/react';
// Mock dependencies
const useLocationMock = jest.fn();
const useAuthMock = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../client/src/lib/queryClient', () => ({
  queryClient: {},
}));

jest.mock('wouter', () => ({
  Switch: ({ children }: { children: React.ReactNode }) => <div data-testid="switch">{children}</div>,
  Route: ({ path, component: Component, children }: { path: string; component?: React.FC; children?: React.ReactNode }) => (
    <div data-testid={`route-${path}`}>{Component ? <Component /> : children}</div>
  ),
  Redirect: ({ to }: { to: string }) => <div data-testid={`redirect-${to}`} />,
  useLocation: () => useLocationMock(),
}));

jest.mock('../client/src/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

jest.mock('../client/src/context/user-context', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="user-provider">{children}</div>,
}));

jest.mock('../client/src/components/layout/app-layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

jest.mock('../client/src/components/transitions/simple-page-transition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div data-testid="page-transition">{children}</div>,
}));

jest.mock('../client/src/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock('../client/src/pages/decision-log', () => ({
  __esModule: true,
  default: () => <div data-testid="decision-log-page">Decision Log</div>,
}));

import App from '../client/src/App';

describe('App Component', () => {
  beforeEach(() => {
    useLocationMock.mockReturnValue(['/']);
    useAuthMock.mockReset();
  });
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('page-transition')).toBeInTheDocument();
    expect(screen.getByTestId('switch')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('redirects to login when navigating to a protected route while unauthenticated', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: false });
    useLocationMock.mockReturnValue(['/decision-log']);
    render(<App />);
    expect(screen.getByTestId('redirect-/login')).toBeInTheDocument();
  });

  it('renders the protected component when authenticated', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: false });
    useLocationMock.mockReturnValue(['/decision-log']);
    render(<App />);
    expect(screen.getByTestId('decision-log-page')).toBeInTheDocument();
  });
});