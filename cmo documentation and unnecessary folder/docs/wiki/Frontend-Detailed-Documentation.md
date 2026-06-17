# Frontend Detailed Documentation

## Purpose

This document explains the CMO.AI frontend in a way that can be reused in graduation project documentation. It covers:

- the frontend stack
- the application structure
- the route and page flow
- the dashboard modules
- the email/Gmail-related flow in the UI
- the screenshot set already available in the repository

## 1. Frontend Overview

The frontend of CMO.AI is a single-page application built with React and TypeScript. Its goal is to provide a clean marketing workspace where a user can move from landing pages and authentication into a protected dashboard that contains campaign planning, brand coaching, content generation, image generation, video generation, calendar planning, and analytics.

The frontend is located in `frontend/` and is built using:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui and Radix UI primitives
- Lucide icons

In architectural terms, the frontend is split into two main areas:

1. Public-facing pages:
   welcome, landing, feature pages, pricing, payment, login, register, forgot password, OTP verification, and password reset.
2. Authenticated workspace:
   the `/dashboard` route, which acts as the main application shell for the actual product features.

## 2. Entry Point and App Bootstrapping

The frontend starts in `frontend/src/main.tsx`. This file mounts the React app into the DOM and wraps the app with `BrowserRouter`. This means the whole interface uses client-side routing.

The `frontend/src/App.tsx` file is intentionally minimal. It only renders the main router component. This keeps the bootstrapping layer simple and moves route definitions into a dedicated file.

The main route configuration is in `frontend/src/app/router.tsx`. This file:

- wraps the application in `AuthProvider`
- mounts the global `Toaster` from `sonner`
- defines all public and protected routes
- wraps the dashboard route in both `ProtectedRoute` and `CampaignProvider`

This means authentication state and campaign state are both available before the dashboard is rendered.

## 3. Styling System and Visual Language

The global styling entry is `frontend/src/index.css`.

The project uses Tailwind CSS for utility-first styling, but it also defines a brand color language and several custom animation helpers.

### Main color direction

The documented design palette in `index.css` is:

- Deep Space Purple `#3B0A57`
- Galaxy Violet `#6A0DAD`
- Electric Purple `#B026FF`
- Neon Blue `#3BE0FF`
- Cosmic Black `#0A0A0F`

These colors create a futuristic AI-product look. Across the frontend, the design repeatedly uses:

- dark backgrounds
- glowing gradients
- soft transparency
- blurred overlays
- rounded cards
- neon-accent buttons

### Reusable visual patterns

The frontend heavily uses:

- gradient hero sections
- glassmorphism cards using `bg-white/10`, `backdrop-blur-*`, and border opacity
- animated blobs and fade-in helpers
- Lucide icons to visually distinguish features and actions

This creates consistency between the marketing pages and the authenticated dashboard, even though the dashboard is denser and more task-oriented.

## 4. Routing Structure

The route map is:

- `/` -> Welcome page
- `/landing` -> Main marketing landing page
- `/login` -> Login page
- `/register` and `/signup` -> Registration page
- `/forgot` and `/forgot-password` -> Password reset request page
- `/verify-otp` -> OTP verification page
- `/reset-password` and `/reset/:token` -> Password reset page
- `/pricing` -> Pricing page
- `/features/:id` -> Dynamic feature detail page
- `/payment` -> Payment page
- `/dashboard` -> Protected application workspace

This route design separates discovery pages from product pages. A user can first learn about the platform and then move into the protected workspace after authentication.

## 5. Authentication Architecture

Authentication is handled by `frontend/src/contexts/AuthContext.tsx`.

This context stores:

- `user`
- `isLoading`
- `login()`
- `register()`
- `logout()`

### How session restoration works

When the app starts, the context checks whether the user appears logged in by reading tokens from local storage. If tokens exist, it calls `getMe()` to restore the session from the backend. If that request fails, tokens are cleared and the user is treated as logged out.

This is important because the frontend does not trust local storage alone. It uses local storage as a quick persistence mechanism, but it still validates the session by requesting the current user from the backend.

### Protected routes

The file `frontend/src/components/protectedRoute.tsx` guards the dashboard. It:

- shows a loading spinner while auth restoration is in progress
- redirects unauthenticated users to `/login`
- allows access only if a user exists in context or the token fallback is still present

This prevents accidental access to the dashboard before auth state is known.

## 6. API Communication Layer

There are two API helpers in the frontend:

- `frontend/src/services/api.ts`
- `frontend/src/lib/api.ts`

The more important shared request wrapper is `lib/api.ts`. It uses `fetch` and provides:

- automatic JSON handling
- optional auth headers
- refresh-token retry on `401`
- normalized frontend-friendly error messages

This wrapper is central because it reduces repeated error-handling logic inside feature services.

### Token handling

The file `frontend/src/lib/auth.ts` manages:

- saving access and refresh tokens
- reading tokens
- clearing tokens
- checking login status

Tokens are stored in `localStorage`, so the session persists across page reloads.

## 7. Public Pages

### 7.1 Welcome Page

Route: `/`

The welcome page is implemented in `frontend/src/pages/Welcome.tsx`.

This page is a full-screen hero entry page. It uses:

- a background image
- dark overlays
- a strong headline
- two primary actions:
  `Explore Platform` and `Sign In`

Its purpose is not deep explanation. Its role is to create a strong first impression and immediately send the user toward either exploration or authentication.

### 7.2 Landing Page

Route: `/landing`

The landing page is implemented in `frontend/src/pages/Landing.tsx`. It composes reusable sections:

- `Navigation`
- `HeroSection`
- `FeatureSection`
- `HowItWorks`
- `CTASection`
- `Footer`

This page acts as the main product marketing page. It introduces the platform capabilities, explains how the system works, and gives the user a call to action.

It also supports hash-based scrolling. If the user opens `/landing#features`, the page waits briefly and then scrolls to that section. This improves navigation from the top header.

### 7.3 Pricing Page

Route: `/pricing`

The pricing page is in `frontend/src/pages/Pricing.tsx`. It reuses:

- `Navigation`
- `PricingHero`
- `PricingCards`
- `PricingFAQ`
- `Footer`

This layout is classic SaaS structure: explain plans, compare options, answer objections, and move the user toward checkout.

### 7.4 Payment Page

Route: `/payment`

The payment page is in `frontend/src/pages/Payment.tsx`.

This page reads the selected plan from the URL query string using `useSearchParams`. It supports:

- free plan activation
- paid-plan card form fields
- basic client-side validation
- simulated payment success or failure

If no valid plan is supplied, the page shows a fallback state telling the user that no plan was selected and provides a button back to pricing.

This page is important for documentation because it demonstrates a conditional UI:

- free plan: immediate activation
- paid plan: card number, expiry, and CVC fields
- success state: confirmation and redirect to dashboard
- error state: retry messaging

### 7.5 Feature Detail Page

Route: `/features/:id`

The feature detail page is in `frontend/src/pages/FeatureDetails.tsx`.

It uses `useParams()` to read the dynamic feature id, then looks up the matching object inside `frontend/src/data/features.ts`.

Each feature page includes:

- hero section
- explanation of why the feature matters
- a list of actions the user can perform
- a use-case section
- a “how it fits into the platform” section
- a demo section
- a final call to action

This is a good example of data-driven UI. Instead of hardcoding a separate page for every feature, one component renders different content using structured configuration.

## 8. Authentication and Email/Gmail-Related Flow

There is no standalone Gmail inbox page or Gmail integration screen in this frontend. The Gmail-related functionality in the user experience is the email-based password recovery flow.

That flow is implemented through three pages:

1. Forgot Password
2. Verify OTP
3. Reset Password

It also connects to backend email sending.

### 8.1 Forgot Password

Route: `/forgot` or `/forgot-password`

File: `frontend/src/pages/auth/ForgotPassword.tsx`

This page:

- validates the email format on the client
- calls `forgotPassword(email)`
- stores the email in `sessionStorage` under `reset_email`
- redirects the user to `/verify-otp`

The UI explains clearly that the user should use the same account email tied to CMO.AI. This is the first place where the email/Gmail-related experience appears.

### 8.2 Verify OTP

Route: `/verify-otp`

File: `frontend/src/pages/auth/VerifyOTP.tsx`

This page:

- reads `reset_email` from `sessionStorage`
- masks the email for privacy
- validates that the OTP is exactly 6 digits
- calls `verifyResetOtp(email, otp)`
- stores the backend-provided reset token in `sessionStorage`
- redirects to `/reset-password`

From a UX perspective, this page is a security checkpoint. It prevents anyone from resetting the password without access to the email inbox where the code was sent.

### 8.3 Reset Password

Route: `/reset-password`

File: `frontend/src/pages/auth/ResetPassword.tsx`

This page:

- reads `reset_email` and `reset_token` from `sessionStorage`
- checks password length
- checks password confirmation
- prevents immediate reuse of the previous password using `old_password`
- calls `resetPassword(...)`
- clears reset-related session storage
- redirects back to login after success

It also includes a password strength indicator, which improves usability and makes the reset flow feel more polished.

### Why “Gmail thing” is better described as an email recovery flow

From the codebase, the frontend does not contain:

- a Gmail API integration screen
- Gmail inbox rendering
- OAuth login with Gmail

What it does contain is an email-driven OTP verification journey. So in project documentation, the accurate description is:

> The system uses email delivery for OTP-based password recovery, and the frontend provides the request, verification, and password reset screens for that flow.

## 9. Shared Auth Layout

All auth-related screens are visually unified by `frontend/src/pages/auth/AuthLayout.tsx`.

This shared wrapper provides:

- the same logo
- the same dark background
- glowing blurred circles
- the same card container
- a shared eyebrow/title/subtitle structure

This gives the login, register, forgot password, verify OTP, and reset password pages a consistent visual identity. From a design-system perspective, this is a good frontend decision because it reduces duplication and makes the auth journey feel coherent.

## 10. Navigation Component

The main marketing-site navigation is in `frontend/src/components/Navigation.tsx`.

This component provides:

- logo
- features navigation
- pricing link
- auth-aware login/logout behavior
- mobile menu toggle

It changes behavior based on whether a user is logged in. For example:

- logged-out users see `Log in`
- logged-in users can see a welcome message and logout

This means the top navigation is not static. It reacts to application state from `AuthContext`.

## 11. Dashboard Architecture

The dashboard is the core of the product. It is implemented in `frontend/src/pages/Dashboard/Dashboard.tsx`.

This file is large because it coordinates:

- selected campaign state
- selected brand state
- active agent/module state
- notification state
- text/image/video chat state
- generated results
- calendar data
- analytics data
- modal state for creating campaigns and brands

### Core dashboard idea

The dashboard is not a collection of separate routes. Instead, it is a single protected workspace that switches internal panels based on the currently active agent.

This design keeps the user inside one command-center environment rather than forcing them to navigate between many pages.

### Dashboard modules

The main dashboard sections are defined in `frontend/src/pages/Dashboard/constants.ts`:

- Orchestrator
- Market Planner
- Brand Coaching
- Market Calendar
- Text Generation
- Image Generation
- Video Generation
- Performance Analytics

Each one has:

- an id
- a display name
- a short name
- a description
- an icon
- an accent color
- a sidebar subtitle

This means the navigation for dashboard modules is configuration-driven rather than manually duplicated.

## 12. Campaign Context

The dashboard depends on `frontend/src/hooks/useCampaign.tsx`.

This context handles:

- campaign list loading
- active campaign persistence
- current campaign details
- linked brand details
- brand audience extraction
- refresh behavior
- newly created campaign registration

It stores the active campaign id in local storage. This improves usability because when a user refreshes the page, the dashboard can restore the previously selected campaign instead of resetting everything.

## 13. Dashboard Workspace Behavior

Inside `Dashboard.tsx`, the interface adapts to whether the user is:

- viewing all brands
- viewing a specific brand
- viewing a specific active campaign

The header computes:

- workspace summary
- workspace detail
- brand name
- brand logo

This dynamic header makes the same dashboard layout reusable for multiple scopes without duplicating the page.

## 14. Dashboard Modules in Detail

### 14.1 Orchestrator

File: `frontend/src/pages/Dashboard/panels/OrchestratorPanel.tsx`

The Orchestrator is the command-center view. It gives the user:

- an overview intro for the current campaign
- audience and launch information
- quick actions
- direct access to the other modules

Its role is coordination. It does not generate final content itself as a specialist tool. Instead, it summarizes readiness and routes the user to the most relevant next step.

### 14.2 Market Planner

File: `frontend/src/pages/Dashboard/panels/MarketPlannerPanel.tsx`

This panel is one of the most explanation-rich parts of the frontend. It collects structured campaign inputs such as:

- brand name
- target audience
- industry
- budget
- product/service
- goal
- selected platforms

It then generates a marketing plan presentation inside the UI. The generated output includes:

- content pillars
- posting schedule
- closing note
- next steps

A notable implementation detail is that this panel contains custom plan-generation logic in the frontend. It even has a travel-specific branch, meaning the interface produces different planning outputs depending on the inferred industry context.

### 14.3 Brand Coaching

File: `frontend/src/pages/Dashboard/panels/BrandPanels.tsx`

This panel focuses on messaging clarity. It displays:

- audience
- positioning
- voice
- current focus actions

Its role is to help align the campaign with a brand identity before content is produced at scale.

### 14.4 Market Calendar

File: `frontend/src/pages/Dashboard/panels/CalendarPanels.tsx`

This panel exposes calendar-related actions such as:

- generate next 14 days
- balance channels
- find calendar gaps

It can display:

- calendar items grouped by date
- channel breakdown information
- explanatory messages when no data is available

This module is important because it translates strategy into execution timing.

### 14.5 Text Generation

File: `frontend/src/pages/Dashboard/panels/TextPanels.tsx`

This panel is for copy generation. It supports:

- LinkedIn posts
- email sequence drafting
- ad hook creation
- freeform text chat

It also shows whether the text agent is running in:

- live model mode
- fallback writing mode

This is useful in a documentation context because it shows the frontend is aware of backend agent availability and can surface that state to the user.

The email-related content generation option appears here as `Draft email sequence`. This is separate from the password-reset email flow. One is marketing copy generation, and the other is account recovery.

### 14.6 Image Generation

File: `frontend/src/pages/Dashboard/panels/ImagePanels.tsx`

This panel supports:

- creating image prompts
- generating variations
- drafting asset briefs
- reviewing visual consistency

It also displays backend status information about image generation readiness. This gives the user transparency about whether the image backend is configured.

### 14.7 Video Generation

File: `frontend/src/pages/Dashboard/panels/VideoPanels.tsx`

This panel supports:

- writing short video scripts
- creating storyboards
- planning creator briefs

Like the image and text modules, it provides loading states and result rendering areas. This keeps the interaction pattern consistent across agent types.

### 14.8 Performance Analytics

File: `frontend/src/pages/Dashboard/panels/AnalyticsPanels.tsx`

This panel reads real analytics data through:

- overview metrics
- channel breakdown metrics

It displays:

- activity status
- total reach
- impressions
- engagement rate
- clicks
- conversions
- per-channel performance

Its quick actions help the user interpret the data rather than only view it. That is a useful product decision because dashboards should support decisions, not only reporting.

## 15. Right-Side Interaction Panel

The dashboard also includes a right-side interaction area implemented in `frontend/src/pages/Dashboard/panels/RightPanel.tsx`.

This panel adapts to the active module and can behave like:

- a suggestion center
- a command box
- a specialist assistant side panel
- a chat interface for text, image, and video tasks

This is one of the most important frontend UX ideas in the project. Instead of forcing every module to create a separate full-page workflow, the design keeps a stable main content area and adds a contextual assistant panel on the side. That makes the dashboard feel more like a workspace and less like a set of unrelated screens.

## 16. Modals and Workspace Creation

The `frontend/src/components/NewCampaignModal.tsx` component is responsible for creating campaigns and brands.

This modal supports:

- loading existing brands
- selecting a brand
- creating a new brand inline
- creating a new campaign linked to a chosen brand
- showing validation and loading states

This component is valuable because it reduces friction. The user does not need to leave the dashboard to create supporting entities before starting a campaign.

## 17. State Management Summary

The frontend uses a pragmatic state strategy rather than a heavy external state library.

### React local state is used for:

- form fields
- loading flags
- modal visibility
- panel-specific interaction state
- current active dashboard module

### Context is used for:

- authentication state
- campaign workspace state

### Browser storage is used for:

- access token
- refresh token
- active campaign id
- reset email
- reset token
- previous password reference in reset flow

This combination is suitable for a medium-sized graduation project because it avoids unnecessary complexity while still supporting persistence and cross-component coordination.

## 18. Component Reuse Strategy

The frontend reuses components at multiple levels.

### Layout-level reuse

- `AuthLayout`
- `Navigation`
- `Footer`

### UI primitive reuse

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Table`
- `Card`
- `Dialog`-style components

### Dashboard-specific reuse

- `ActionRow`
- `ResultDialog`
- `MetricCard`
- `CampaignBrief`
- `SuggestionList`

This layered reuse is a strength of the frontend because it keeps visuals and interactions consistent while still allowing different modules to feel specialized.

## 19. Screenshot Inventory

The repository already contains a screenshot set in `documentation-screenshots/`.

### Main public and dashboard screenshots

- `documentation-screenshots/01-welcome.png`
- `documentation-screenshots/02-landing.png`
- `documentation-screenshots/03-login.png`
- `documentation-screenshots/04-register.png`
- `documentation-screenshots/05-forgot-password.png`
- `documentation-screenshots/06-pricing.png`
- `documentation-screenshots/07-payment.png`
- `documentation-screenshots/08-dashboard-orchestrator.png`
- `documentation-screenshots/09-dashboard-brand.png`
- `documentation-screenshots/10-dashboard-calendar.png`
- `documentation-screenshots/11-dashboard-text.png`
- `documentation-screenshots/12-dashboard-image.png`
- `documentation-screenshots/13-dashboard-video.png`
- `documentation-screenshots/14-dashboard-analytics.png`

### Additional auth/payment/feature screenshots

- `documentation-screenshots/gannah-eid-el-adha-2026/01-welcome.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/02-landing.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/03-login.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/04-register.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/05-forgot-password.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/06-verify-otp.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/07-reset-password.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/08-pricing.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/09-payment-no-plan.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/10-payment-pro-checkout.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/11-feature-brand-coaching.png`
- `documentation-screenshots/gannah-eid-el-adha-2026/12-feature-market-planning.png`

### How to reference screenshots in the written report

For the graduation document, a clean ordering would be:

1. Welcome page
2. Landing page
3. Login page
4. Register page
5. Forgot password page
6. Verify OTP page
7. Reset password page
8. Pricing page
9. Payment page
10. Dashboard Orchestrator
11. Brand Coaching
12. Market Calendar
13. Text Generation
14. Image Generation
15. Video Generation
16. Performance Analytics
17. Feature detail pages

This order tells the story of the user journey from entry into full product use.

## 20. Suggested Graduation-Project Description

The CMO.AI frontend is a React-based single-page application designed as both a marketing website and an operational AI workspace. Public pages introduce the platform, explain features, and guide the user through pricing and onboarding. After authentication, the user enters a protected dashboard that acts as a command center for campaign planning, brand definition, content generation, media production, scheduling, and analytics.

From an engineering perspective, the frontend uses React Router for navigation, Context API for authentication and campaign state, Tailwind CSS for styling, and reusable UI primitives for consistency. The dashboard follows a modular design where each business capability is rendered as a focused panel while preserving a shared workspace layout. The password recovery flow also demonstrates secure email-based OTP verification, which is the main Gmail/email-related interaction present in the frontend.

## 21. Final Accuracy Note

For documentation accuracy, do not describe the frontend as having a Gmail inbox, Gmail OAuth, or Gmail management interface unless you add one later. Based on the current codebase, the correct description is:

- email-based OTP recovery flow
- email campaign copy generation inside the Text Generation module

That wording matches the real implementation.
