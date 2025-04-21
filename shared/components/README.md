# Digital Desk Shared Component Library

This directory contains the shared component library for Digital Desk, organized according to atomic design principles.

## Architecture

The component library follows atomic design methodology, which organizes components into three main categories:

1. **Atoms**: Basic, indivisible UI elements
2. **Molecules**: Groups of atoms functioning together as a unit
3. **Organisms**: Complex UI components composed of molecules and atoms

## Directory Structure

```
shared/components/
├── atoms/           # Basic building blocks (Button, Input, etc.)
├── molecules/       # Combinations of atoms (Card, FormField, etc.)
├── organisms/       # Complex components (DashboardPanel, etc.)
└── index.ts         # Main barrel file exporting all components
```

## Design System

The component library is built on top of a comprehensive design system implemented as CSS variables in `client/src/index.css` and referenced in `tailwind.config.ts`. Key aspects include:

- **Typography**: Font sizes, weights, and line heights
- **Spacing**: Consistent spacing scale
- **Colors**: Domain-specific color palettes for different application areas
- **Shadows**: Elevation system
- **Border Radius**: Consistent rounding
- **Transitions**: Animation timing and easing

## Key Design Tokens

Domain-specific colors are defined for each feature area:

- **Thinking Desk**: Blue-based palette (`--thinking-desk-primary`, etc.)
- **Offer Vault**: Green-based palette (`--offer-vault-primary`, etc.)
- **Decision Log**: Amber/yellow-based palette (`--decision-log-primary`, etc.)
- **Personal Clarity**: Purple-based palette (`--personal-clarity-primary`, etc.)

## Usage Guidelines

### Importing Components

Import components directly from their respective categories:

```tsx
// Using relative imports
import { Button } from '../../../shared/components/atoms/button.js';
import { Card } from '../../../shared/components/molecules/card.js';
import { DashboardPanel } from '../../../shared/components/organisms/dashboard-panel.js';
```

### Component Customization

Most components accept a `domain` prop that applies domain-specific styling:

```tsx
// Example: Button with domain-specific styling
<Button variant="thinking-desk">Save</Button>

// Example: Card with domain-specific styling
<Card domain="offer-vault">Content here</Card>

// Example: Dashboard panel with domain-specific styling
<DashboardPanel 
  title="Brain Dump" 
  domain="thinking-desk"
  icon={<BrainIcon />}
>
  Content here
</DashboardPanel>
```

## Feature-Based Organization

The application is organized into feature-based modules:

```
client/src/features/
├── thinking-desk/      # Brain dump, problem trees, etc.
├── offer-vault/        # Job offers, compensation tracking
├── decision-log/       # Decision tracking and analysis
└── personal-clarity/   # Reflections, check-ins, etc.
```

Each feature module maintains its own domain-specific components that build upon the shared component library.