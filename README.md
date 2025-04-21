# Digital Desk

A comprehensive, digital workspace for entrepreneurs to organize their thoughts, brainstorm effectively, and make strategic decisions.

## Documentation

Digital Desk's documentation has been organized into several focused guides:

- **Main README (this file)** - Overview, environment setup, and general architecture
- **[ERROR-HANDLING.md](./ERROR-HANDLING.md)** - Comprehensive error handling guide
- **[PRISMA-GUIDE.md](./PRISMA-GUIDE.md)** - Prisma ORM usage and best practices
- **[COMPONENT-GUIDE.md](./COMPONENT-GUIDE.md)** - UI component usage and patterns
- **[SCRIPTS.md](./SCRIPTS.md)** - Utility scripts and database management tools

## Features

- **Thinking Desk**: Organized space for brainstorming and working through complex problems
- **Offer Vault**: Catalogue of product and service offers with organized details
- **Decision Log**: Track important decisions and the reasoning behind them
- **Personal Clarity**: Tools for reflection, goals, and tracking progress

## Recent Optimizations

We've recently made several optimizations to improve performance and user experience:

1. **Codebase Refactoring & Architecture Improvements**:
   - Standardized on Prisma ORM, removing deprecated Drizzle code
   - Added Pino logger for structured logging and request tracking
   - Centralized utility scripts in `/scripts` directory
   - Created comprehensive error handling documentation
   - Added Jest testing infrastructure and GitHub Actions workflow

2. **Responsive UI Improvements**:
   - Enhanced responsive design across components including the Offer Vault, mobile navigation, and card layouts

3. **Performance Optimizations**:
   - Implemented memoization strategies in app layout and key components with React.memo
   - Used LazyMotion for framer-motion to load animations on demand
   - Added debounced window resize handlers in responsive hooks
   - Added Lighthouse CI configuration for performance monitoring

4. **User Experience Enhancements**:
   - Better loading indicators and empty states with helpful messages
   - Implemented consistent status badges and icons
   - Improved form validation with helpful descriptions
   - Enhanced logging and error handling for better debugging

5. **Accessibility Improvements**:
   - Added proper aria attributes to navigation components
   - Better keyboard navigation support
   - Improved color contrast for text elements
   - Added proper semantic HTML structure

## Development Guide for Replit

### Environment Setup

1. **Using Replit Workflow:**
   - The application is configured to run using the Replit workflow system
   - Use the "Start application" workflow to run the application 
   - Do NOT manually start the server using npm/yarn commands

2. **Package Management:**
   - Do NOT modify `package.json` directly
   - Use the Replit package manager tool to install dependencies

3. **Environment Variables:**
   - The database connection string is available in the `DATABASE_URL` environment variable
   - JWT secret is configured for authentication

### Technology Stack

- **Frontend:** React with TypeScript and Tailwind CSS
- **Backend:** Express.js API with TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT-based authentication
- **UI Components:** ShadCN UI library

### Architecture Notes

#### Database Access

- **ORM:** Prisma is used as the ORM for database access
- **Implementation:** Use the PrismaStorage implementation in `server/prisma-storage.ts`
- **Documentation:** Refer to [PRISMA-GUIDE.md](./PRISMA-GUIDE.md) for detailed information

#### API Structure

- **Routing:** Express routes are defined in `server/routes.ts`
- **Authentication:** JWT authentication is handled in `server/middleware/auth.js`
- **Request Validation:** Validation is done using Zod schemas

#### Frontend Structure

- **Routing:** Uses wouter for client-side routing
- **State Management:** Uses React Context API (see `context/user-context.tsx`)
- **Data Fetching:** Uses React Query for data fetching and cache management
- **Forms:** Uses react-hook-form with Zod validation

### Component Guidelines

1. **Loading States:**
   - Use the `LoadingState` component for consistent loading UIs
   - Example: `<LoadingState variant="skeleton" count={3} />`

2. **Error Handling:**
   - See [ERROR-HANDLING.md](./ERROR-HANDLING.md) for the comprehensive error handling guide
   - Always wrap critical components with the ErrorBoundary component

3. **Subscription Features:**
   - Follow the simplified subscription model (Trial, Monthly, Annual)
   - Use the `subscription-service.ts` for subscription features

### Replit-Specific Best Practices

1. **Environment & Path Configuration:**
   - Use relative URLs for API endpoints (e.g., `/api/offers` not `http://localhost:3000/api/offers`)
   - Use `0.0.0.0` instead of `localhost` for host bindings
   - Use relative paths from project root and never reference `/repo/` in code

2. **Protected Files & Configuration:**
   - Never modify system configuration files: Vite (`vite.config.ts`, `server/vite.ts`), TypeScript (`tsconfig.json`, `tsconfig.server.json`), or Replit (`.replit`, `replit.nix`)
   - Use Replit package manager tool instead of directly modifying `package.json`

3. **Database Operations:**
   - Use Prisma methods for database operations (see [PRISMA-GUIDE.md](./PRISMA-GUIDE.md))
   - Use Prisma migrations for schema changes (`npx prisma db push`)

4. **Performance Considerations:**
   - Use React.memo for expensive components
   - Leverage React Query's caching capabilities
   - Use proper code splitting with lazy loading

### Debugging in Replit

1. **Application Logs:**
   - Check the Replit workflow logs for backend errors
   - Use the browser console for frontend errors
   - Review structured logs in Pino format with proper context

2. **API Testing:**
   - Test API endpoints using the browser's network tab
   - Use properly structured API requests with error handling
   - Check request and response logs with status codes

3. **Database Issues:**
   - Use the database helper script for diagnostics: `./scripts/run.sh db diagnose`
   - Reset database when needed: `./scripts/run.sh db reset`
   - Use the provided SQL execution tool for database inspection
   - Check Prisma Client errors for detailed database error information
   
4. **Utility Scripts:**
   - See [SCRIPTS.md](./SCRIPTS.md) for all available utility scripts
   - Use centralized script runner: `./scripts/run.sh <script-name>`

### Subscription Testing

The system now uses a simplified subscription model:

- **Trial Plan:** 7-day free trial with limited features
- **Monthly Plan:** $28/month with unlimited features
- **Annual Plan:** $285.60/year (15% discount) with unlimited features

To test subscription features, navigate to `/subscription-plans`
