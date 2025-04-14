# DailyFuel Development Roadmap

This roadmap outlines the steps needed to implement the DailyFuel product as specified in the PRODUCT_SPEC.md file. It is organized into phases with specific actionable tasks.

## Product Overview

DailyFuel is a community-focused habit-building platform where users create and join challenges to develop consistent routines **together**. The core concept centers on shared accountability - users don't just track their own habits in isolation but build them alongside friends, family, or colleagues through communal challenges.

### Why Build Habits Together?

Research shows that habit formation is 65% more successful when people have accountability partners. DailyFuel leverages this by:

- **Shared Commitment**: When you publicly commit to a challenge with people you know, you're more likely to follow through
- **Positive Peer Pressure**: Seeing others in your circle making progress motivates you to keep going
- **Celebration of Wins**: Group acknowledgment of progress creates stronger positive reinforcement than solo tracking
- **Built-in Support System**: Having others on the same journey provides encouragement during difficult days

The product allows challenge creators to invite specific people via shareable links, creating small, trusted communities focused on mutual growth rather than exposing users to a public feed of strangers.

## Phase 1: Database Setup and Authentication

1. **Configure Supabase Database Schema using MCP server**
   - Create `users` table with fields:
     - `id` (uuid, PK)
     - `name` (text)
     - `email` (text)
     - `is_subscriber` (boolean)
     - `stripe_customer_id` (text)
     - `subscription_status` (text)
     - `current_period_end` (timestamp)
     - `created_at` (timestamp)
   - Create `challenges` table with fields:
     - `id` (uuid, PK)
     - `creator_id` (uuid, FK to users.id)
     - `title` (text)
     - `description` (text)
     - `daily_goal` (text)
     - `duration_days` (integer)
     - `start_date` (date)
     - `created_at` (timestamp)
   - Create `challenge_participants` table with fields:
     - `id` (uuid, PK)
     - `challenge_id` (uuid, FK to challenges.id)
     - `user_id` (uuid, FK to users.id)
     - `joined_at` (timestamp)
   - Create `daily_logs` table with fields:
     - `id` (uuid, PK)
     - `challenge_id` (uuid, FK to challenges.id)
     - `user_id` (uuid, FK to users.id)
     - `date` (date)

2. **Setup Authentication**
   - Configure magic link and Google Auth with Supabase
   - Implement sign-in page (/signin route already exists)
   - Setup auth middleware and protected routes

## Phase 2: Core Pages and Components

1. **Update Landing Page (/)**
   - Create hero section with DailyFuel branding
   - Add pricing information for subscription plans
   - Add login/signup buttons
   - Implement testimonials section (optional)

2. **Dashboard Page (/dashboard)**
   - Create joined challenges section
   - Create created challenges section (for subscribers)
   - Add "Create Challenge" button (visible only to subscribers)

3. **Create Challenge Page (/create)**
   - Build challenge creation form with fields:
     - Title
     - Description
     - Daily goal
     - Duration (days)
     - Start date
   - Implement form validation
   - Connect form to Supabase to save challenge data
   - Add subscriber-only access check

4. **Challenge View Page (/challenge/[id])**
   - Display challenge details (title, description, duration, daily goal)
   - Show progress tracking UI (calendar, progress bar)
   - Implement daily check-in functionality
   - Display current streak information
   - Add sharing functionality for challenge link

5. **Profile Page (/profile)**
   - Display user information
   - Show subscription status
   - List streak history and statistics
   - Add account settings options

6. **Upgrade Page (/upgrade)**
   - Connect to Stripe checkout
   - Display subscription options ($6/month, $54/year)
   - Implement redirect to Stripe checkout

## Phase 3: Database Functionality and API Routes

1. **Create API Routes**
   - `/api/challenges` - CRUD operations for challenges
   - `/api/challenges/join` - Endpoint for joining challenges
   - `/api/progress` - Track daily progress
   - `/api/user` - User data operations

2. **Implement Data Access Layer**
   - Create helper functions for database operations
   - Implement query builders and data validators
   - Set up error handling and logging

## Phase 4: Stripe Integration

1. **Configure Stripe**
   - Set up monthly ($6) and yearly ($54) subscription plans in Stripe dashboard
   - Update config.ts with new plan information
   - Configure webhook handling for subscription events

2. **Implement Subscription Logic**
   - Connect Stripe webhook to user subscription status updates
   - Implement access control for subscriber-only features
   - Set up subscription status checking middleware

## Phase 5: User Experience Features

1. **Progress Tracking**
   - Implement calendar view for tracking daily progress
   - Add streak counter and visualization
   - Create progress statistics

2. **Challenge Sharing**
   - Generate shareable challenge links
   - Implement joining via link functionality
   - Add social sharing options

3. **User Interface Improvements**
   - Implement responsive design for all screen sizes
   - Create consistent styling across all pages
   - Add loading states and error handling

## Phase 6: Testing and Optimization

1. **Testing**
   - Test authentication flow
   - Test challenge creation and joining
   - Test daily progress tracking
   - Test subscription flow
   - Test responsive design

2. **Optimization**
   - Optimize database queries
   - Implement caching strategies
   - Optimize assets and loading performance

## Phase 7: Deployment and Launch

1. **Final Deployment**
   - Deploy to Vercel
   - Configure production environment variables
   - Set up monitoring and error tracking

2. **Launch Preparations**
   - Create documentation
   - Prepare marketing materials
   - Set up analytics

## Next Steps After MVP

1. **Analytics Dashboard**
   - Implement more detailed statistics for challenge creators
   - Add user engagement metrics

2. **Notification System**
   - Add daily reminders
   - Implement achievement notifications

3. **Challenge Templates**
   - Create pre-defined challenge templates for common habits
   - Allow users to clone and customize templates

4. **Community Features**
   - Implement comments or discussion for challenges
   - Add leaderboards for challenge participants

## Technical Debt and Considerations

1. **Database Indexing**
   - Add appropriate indexes for frequently queried fields
   - Monitor query performance and optimize as needed

2. **Security**
   - ✅ Implement row-level security in Supabase
   - ✅ Add proper error handling and validation for Stripe webhook endpoint
   - ✅ Implement URL validation and improved security for Stripe checkout
   - ✅ Replace external image references with local/CDN hosted images
   - Set up proper authorization checks for all API routes

3. **Error Handling**
   - Create comprehensive error handling strategy
   - Implement logging for debugging and monitoring

This roadmap provides a structured approach to implementing the DailyFuel product. Each phase builds upon the previous one, allowing for incremental development and testing.
