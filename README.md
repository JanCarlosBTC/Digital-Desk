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

## Instructions for Replit Testing

### Setup & Environment

1. **Import the Project:**
   - Upload the project to Replit or clone from GitHub
   - Make sure to set the environment as Node.js

2. **Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Testing User Authentication

Since the authentication system is still using a mock implementation in `auth-service.ts`, you can test it using the following credentials:

- **Username:** demo
- **Password:** password123

The authentication flow will work without making real API calls to a backend server. The system will generate a demo token and create a mock user session.

### Testing Subscription Payments

1. **Navigate to Subscription Plans:**
   - Go to the subscription plans page through the UI
   - Or navigate directly to `/subscription-plans`

2. **Testing Payment Flow:**
   - For testing in Replit, the payment system is set to simulation mode
   - Click on any plan to upgrade
   - It will simulate a payment flow without requiring real payment information
   - The system will update the user's plan after the simulated payment

3. **Test Subscription Features:**
   - After "upgrading," test features that are specific to your plan:
     - Creating offers in the Offer Vault
     - Building Problem Trees
     - Exporting content (if available on your plan)

### Testing API Interactions

Since Replit doesn't have a real backend connected, the API calls are intercepted using a mock implementation. To see the API interaction:

1. Open the browser developer tools (F12)
2. Go to the Network tab
3. Perform actions in the app that would trigger API calls
4. You'll see the mocked API responses with appropriate status codes

### Testing Responsive Design

1. Use the device toolbar in your browser's dev tools to simulate different screen sizes
2. Test the mobile view (below 768px width)
3. Test tablet view (768px - 1280px)
4. Test desktop view (above 1280px)

The new responsive hooks should provide a smooth experience across all device sizes.

## Development

1. Clone the repository
2. Install dependencies with `npm install` or `yarn install`
3. Start the development server with `npm run dev` or `yarn dev`
4. Navigate to `http://localhost:3000`

## Contributing

1. Create a feature branch from `development`
2. Make your changes
3. Submit a pull request to the `development` branch 