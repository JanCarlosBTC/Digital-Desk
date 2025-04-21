# Digital Desk Component Library

This document outlines the component architecture and design patterns used in the Digital Desk application.

## Architecture Overview

The Digital Desk codebase follows a modern, maintainable architecture with:

1. **Atomic Design Structure**: Components are organized into atoms, molecules, and organisms
2. **Feature-Based Organization**: Business logic is grouped by domain
3. **Domain-Specific Styling**: Each feature domain has consistent visual identity
4. **Clean Import Patterns**: Barrel files for simplified imports

## Component Structure

### Shared Components

The shared component library follows atomic design principles:

- **Atoms**: Basic building blocks (Button, Input)
- **Molecules**: Combinations of atoms (Card, FormField)
- **Organisms**: Complex UI structures (DashboardPanel)

### Feature Components

Feature-specific components are organized by domain:

- **Thinking Desk**: Brain dump, problem trees, drafted plans
- **Offer Vault**: Offer tracking, comparison tools
- **Decision Log**: Decision tracking, confidence measurement
- **Personal Clarity**: Reflections, check-ins, goal tracking

## Design System

### Domain-Specific Theming

Each feature domain has its own color palette:

- **Thinking Desk**: Creative exploration and thought organization
- **Offer Vault**: Data comparison and analysis
- **Decision Log**: Structure and reasoning tracking
- **Personal Clarity**: Reflection and personal growth

### Component Variants

Components support different variants:

1. **Variant**: Visual style (default, outline, ghost)
2. **Size**: Component sizing (sm, default, lg)
3. **Domain**: Feature-specific styling

## Usage Guidelines

### Component Import Pattern

```tsx
// Import from shared component library
import { Button } from '../../../shared/components/atoms/button';
import { Card } from '../../../shared/components/molecules/card';
import { DashboardPanel } from '../../../shared/components/organisms/dashboard-panel';

// OR use barrel files
import { Button } from '../../../shared/components/atoms';
import { Card } from '../../../shared/components/molecules';
import { DashboardPanel } from '../../../shared/components/organisms';
```

### Feature-Specific Components

```tsx
// Import feature components
import { DecisionCard } from '../../features/decision-log/components/decision-card';
import { MonthlyCheckInCard } from '../../features/personal-clarity/components/monthly-check-in-card';

// OR use barrel files
import { DecisionLog } from '../../features';
const { DecisionCard } = DecisionLog;
```

## Key Design Decisions

1. **Domain Prop**: All shared components accept a `domain` prop that applies feature-specific styling
2. **Composition Pattern**: Complex UIs are built through component composition
3. **Icon Support**: Components like Button support `leadingIcon` and `trailingIcon` props
4. **Error States**: Form components have built-in error display capabilities
5. **Responsive Design**: All components are designed to work on mobile, tablet, and desktop