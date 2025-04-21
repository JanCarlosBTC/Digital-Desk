import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../client/src/App';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../client/src/lib/queryClient', () => ({
  queryClient: {},
}));

jest.mock('wouter', () => ({
  Switch: ({ children }: { children: React.ReactNode }) => <div data-testid="switch">{children}</div>,
  Route: ({ path }: { path: string }) => <div data-testid={`route-${path}`} />,
  useLocation: () => ['/'],
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

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('page-transition')).toBeInTheDocument();
    expect(screen.getByTestId('switch')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});