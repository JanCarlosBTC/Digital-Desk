import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'ghost';
  domain?: 'thinking-desk' | 'offer-vault' | 'decision-log' | 'personal-clarity' | 'default';
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card(props: CardProps): JSX.Element;
export function CardHeader(props: CardHeaderProps): JSX.Element;
export function CardTitle(props: CardTitleProps): JSX.Element;
export function CardDescription(props: CardDescriptionProps): JSX.Element;
export function CardContent(props: CardContentProps): JSX.Element;
export function CardFooter(props: CardFooterProps): JSX.Element;