# Digital Desk

A comprehensive, digital workspace for entrepreneurs to organize their thoughts, brainstorm effectively, and make strategic decisions.

## Features

- **Thinking Desk**: Organized space for brainstorming and working through complex problems
- **Offer Vault**: Catalogue of product and service offers with organized details
- **Decision Log**: Track important decisions and the reasoning behind them
- **Personal Clarity**: Tools for reflection, goals, and tracking progress

## Recent Optimizations

We've recently made several optimizations to improve performance and user experience:

1. **Responsive UI Improvements**:
   - Enhanced Offer Vault component with proper responsive design
   - Optimized mobile navigation with touch-friendly interactions
   - Added proper responsive card layouts and grid system

2. **Performance Optimizations**:
   - Implemented memoization in the app layout to prevent unnecessary re-renders
   - Used LazyMotion for framer-motion to load animations on demand
   - Added debounced window resize handlers in the responsive hooks
   - Implemented component memoization with React.memo for key components

3. **Error Handling Improvements**:
   - Completely revamped error boundary with better error categorization
   - Added user-friendly error messages based on error type
   - Implemented error IDs for better tracking and debugging
   - Added comprehensive error recovery strategies

4. **User Experience Enhancements**:
   - Better loading indicators in multiple components
   - Added proper empty states with helpful messages
   - Implemented consistent status badges and icons
   - Improved form validation with helpful descriptions

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
- **Important:** The project has migrated from Drizzle ORM to Prisma ORM. Do not use Drizzle methods

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
   - Use the Error Boundary component for catching rendering errors
   - Handle API errors with proper user feedback using toast notifications

3. **Subscription Features:**
   - Follow the simplified subscription model (Trial, Monthly, Annual)
   - Use the `subscription-service.ts` for subscription features

### Replit-Specific Best Practices

1. **Backend URLs:**
   - Always use relative URLs for API endpoints (e.g., `/api/offers` not `http://localhost:3000/api/offers`)
   - Use `0.0.0.0` instead of `localhost` for host bindings

2. **File Path References:**
   - Use relative paths from project root instead of absolute paths
   - Never reference `/repo/` in your code

3. **Protected Files:**
   - Do not modify Vite configuration files (`vite.config.ts`, `server/vite.ts`)
   - Do not modify TypeScript configuration (`tsconfig.json`, `tsconfig.server.json`)
   - Do not modify Replit configuration files (`.replit`, `replit.nix`)

4. **Database Operations:**
   - Use Prisma methods for database operations
   - Avoid direct SQL queries where possible
   - Use Prisma migrations for schema changes

5. **Performance Considerations:**
   - Use React.memo for expensive components
   - Leverage React Query's caching capabilities
   - Use proper code splitting with lazy loading

### Debugging in Replit

1. **Application Logs:**
   - Check the Replit workflow logs for backend errors
   - Use the browser console for frontend errors

2. **API Testing:**
   - Test API endpoints using the browser's network tab
   - Use properly structured API requests with error handling

3. **Database Issues:**
   - Use the provided SQL execution tool for database inspection
   - Check Prisma Client errors for detailed database error information

### Subscription Testing

The system now uses a simplified subscription model:

- **Trial Plan:** 7-day free trial with limited features
- **Monthly Plan:** $28/month with unlimited features
- **Annual Plan:** $285.60/year (15% discount) with unlimited features

To test subscription features, navigate to `/subscription-plans` 