import React from 'react';

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthRequired({ children }: AuthRequiredProps) {
  return <>{children}</>;
}