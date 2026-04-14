# Complete System Architecture Guide - Interview Preparation

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Frontend Working](#frontend-working)
5. [Backend Working](#backend-working)
6. [API Documentation](#api-documentation)
7. [Core Features & Logic](#core-features--logic)
8. [Data Flow](#data-flow)
9. [Interview Q&A](#interview-qa)

---

## 📌 PROJECT OVERVIEW

**Project Name**: Personal Developer Portfolio  
**Type**: Full-Stack Web Application  
**Purpose**: A Modern Portfolio Website showcasing developer skills, projects, GitHub activity, and enabling AI-assisted interactions

### Key Features:

- **Dynamic Homepage** with hero section, skills, projects showcase
- **AI Chat Widget** for project recommendations and general inquiries
- **GitHub Integration** to display real-time activity and contributions
- **Contact Form** with email notifications
- **Admin Dashboard** for content management
- **Blog System** for technical articles
- **Authentication** with Supabase
- **PWA Support** for offline capability

---

## 🛠️ TECH STACK

### Frontend

```
Frontend Framework:     React 18+ with TypeScript
Build Tool:            Vite (Lightning-fast bundling)
State Management:      React Context API, TanStack React Query
UI Components:         shadcn/ui (Radix UI based)
Styling:              Tailwind CSS
Animations:           Framer Motion
3D Graphics:          Three.js with React Three Fiber
Forms:                React Hook Form + Zod validation
Routing:              React Router v6
PWA:                  Vite PWA Plugin
```

### Backend

```
Backend Platform:      Supabase (PostgreSQL + serverless functions)
Serverless Runtime:    Deno (TypeScript support)
Database:             PostgreSQL (Supabase)
Authentication:       Supabase Auth
Email Service:        Resend API
AI/LLM:              Lovable AI Gateway (Google Gemini 2.5 Flash)
External APIs:        GitHub REST API
```

### DevOps & Tools

```
Version Control:      Git & GitHub
Package Manager:      pnpm / npm / bun
Linting:             ESLint
Environment:         Node.js
Deployment:          Lovable (automatic from GitHub)
```

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER BROWSER                              │
│  (React App + Vite Build)                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐  ┌───────────┐  ┌──────────┐
    │ GitHub │  │ Supabase  │  │ Lovable  │
    │  API   │  │  API      │  │ AI Gate  │
    └────────┘  └───────────┘  └──────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌──────────────────────────────────────┐
    │  Supabase Functions                  │
    │  (Deno - TypeScript)                 │
    │  - ai-assistant (Chat & AI)          │
    │  - github-activity (GitHub Data)     │
    │  - send-contact-email (Email)        │
    └──────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │  PostgreSQL Database                 │
    │  (Supabase)                          │
    │  - Contact submissions               │
    │  - User sessions                     │
    │  - Admin data                        │
    └──────────────────────────────────────┘
```

---

## 💻 FRONTEND WORKING

### 1. **Application Entry Point**

**File**: `src/main.tsx`

```typescript
- Mounts React app to #root DOM element
- Uses React 18+ createRoot API
```

**File**: `src/App.tsx`

```typescript
- Main router setup with React Router v6
- Wraps app with providers:
  * QueryClientProvider (TanStack React Query)
  * ThemeProvider (dark/light mode)
  * AuthProvider (authentication context)
  * TooltipProvider (UI tooltips)
```

### 2. **Routing Structure**

| Route         | Component      | Purpose                         |
| ------------- | -------------- | ------------------------------- |
| `/`           | `Index.tsx`    | Main homepage with all sections |
| `/auth`       | `Auth.tsx`     | Login/signup page               |
| `/admin`      | `Admin.tsx`    | Admin dashboard (protected)     |
| `/blog`       | `Blog.tsx`     | Blog listing page               |
| `/blog/:slug` | `BlogPost.tsx` | Individual blog post            |
| `*`           | `NotFound.tsx` | 404 page                        |

### 3. **Homepage Structure** (`src/pages/Index.tsx`)

```
Index Page
├── Navbar (Navigation)
├── Hero (Hero section with intro)
├── About (About me section)
├── Skills (Technical skills showcase)
├── Projects (Portfolio projects)
├── Timeline (Career timeline)
├── GitHubActivity (GitHub contributions)
├── Testimonials (Client testimonials)
├── Contact (Contact form)
├── Newsletter (Email subscription)
└── Footer (Footer)
└── AIChatWidget (Floating AI chat)
```

### 4. **Key Components Flow**

**Component Hierarchy**:

```
App
├── Navbar
│   ├── NavLinks
│   └── ThemeToggle
├── Index Page
│   └── All sections above
├── AIChatWidget
│   ├── Chat Messages Display
│   └── Input Field
└── UI Components
    ├── Button, Input, Textarea
    ├── Dialog, Popover, Dropdown
    └── Skeleton, Toast, Card
```

### 5. **State Management**

**React Context** (`src/contexts/AuthContext.tsx`):

- Manages user authentication
- Provides `useAuth()` hook
- Tracks admin role
- Handles sign-in, sign-up, sign-out

**React Query**:

- Manages API data caching
- Handles loading, error states
- Provides `useQuery`, `useMutation` hooks

**Local State**:

- Form state (useState)
- UI state (modals, dropdowns, etc.)

### 6. **Custom Hooks** (`src/hooks/`)

| Hook                  | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `useAIAssistant()`    | Chat, project recommendations, skill matching      |
| `useGitHubActivity()` | Fetch GitHub profile, repos, events, contributions |
| `useProjects()`       | Fetch portfolio projects                           |
| `use-toast()`         | Display toast notifications                        |
| `use-mobile()`        | Detect mobile viewport                             |

---

## ⚙️ BACKEND WORKING

### 1. **Backend Infrastructure**

**Supabase** provides:

- PostgreSQL Database
- Authentication system
- Serverless Functions (Deno runtime)
- Real-time subscriptions

### 2. **Serverless Functions** (`supabase/functions/`)

#### **A. AI Assistant** (`ai-assistant/index.ts`)

**Purpose**: AI-powered chat and recommendations

**Request Types**:

```typescript
{
  type: "chat",              // General conversation
  type: "recommend-projects",// Recommend projects based on interests
  type: "skill-match",       // Match job requirements to skills
  type: "summarize-project"  // Create project summaries
}
```

**Features**:

- Rate limiting (10 requests/minute per IP)
- Input validation
- Uses Lovable AI Gateway → Google Gemini 2.5 Flash
- CORS enabled for frontend access
- Error handling

**Flow**:

```
Frontend Chat Input
    ↓
Supabase Function (ai-assistant)
    ↓
Validate input + Rate limit check
    ↓
Send to Lovable AI Gateway
    ↓
Google Gemini 2.5 Flash processes
    ↓
Return AI response to Frontend
```

#### **B. GitHub Activity** (`github-activity/index.ts`)

**Purpose**: Fetch and aggregate GitHub user data

**Supported Queries**:

```typescript
type: "profile"; // Get user profile info (followers, repos, etc.)
type: "repos"; // Get top 10 recent repositories
type: "events"; // Get public activity events
type: "stats"; // Get aggregated statistics
```

**Data Fetched**:

- User profile (avatar, bio, company, location)
- Repository information (stars, forks, language)
- Public events (pushes, pull requests, issues)
- Contribution calendar
- Top languages by usage

**Flow**:

```
Frontend Request (GitHub username)
    ↓
Supabase Function (github-activity)
    ↓
Fetch from GitHub REST API (with auth token)
    ↓
Process/aggregate data
    ↓
Return formatted data to Frontend
```

#### **C. Send Contact Email** (`send-contact-email/index.ts`)

**Purpose**: Handle contact form submissions

**Features**:

- Input validation with Zod schema
- Rate limiting (3 submissions/minute per IP)
- HTML sanitization (XSS prevention)
- Email sending via Resend API
- Database storage via Supabase

**Process**:

```
1. Receive contact form data {name, email, subject, message}
2. Validate all fields
3. Check rate limit
4. Sanitize HTML to prevent XSS
5. Save to database (Supabase)
6. Send email via Resend API (2 emails):
   - User confirmation email
   - Admin notification email
7. Return success/error
```

**Database Schema**:

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200),
  email VARCHAR(255),
  subject VARCHAR(500),
  message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### 3. **Database** (`supabase/config.toml`)

**Tables**:

- `auth.users` - Supabase Auth (automatic)
- `public.contacts` - Contact form submissions
- Additional tables for blog, projects, etc.

**Authentication**:

- Supabase built-in authentication
- Session tokens stored in localStorage
- Auto-refresh tokens
- Row-level security (RLS) policies

---

## 🔌 API DOCUMENTATION

### **1. AI Assistant Endpoint**

**URL**: `https://<project>.supabase.co/functions/v1/ai-assistant`

**Method**: POST

**Headers**:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <supabase_token>" // Optional
}
```

**Request Body - Chat**:

```json
{
  "type": "chat",
  "data": {
    "message": "Tell me about your React experience"
  }
}
```

**Response**:

```json
{
  "result": "AI-generated response about React experience...",
  "tokens_used": 150
}
```

**Request Body - Project Recommendation**:

```json
{
  "type": "recommend-projects",
  "data": {
    "interests": "machine learning, python",
    "viewedProjects": ["proj-1", "proj-2"],
    "projects": [{...}, {...}]
  }
}
```

**Error Responses**:

```json
{
  "error": "Invalid request type" // 400
}

{
  "error": "Too many requests. Please try again later." // 429
}

{
  "error": "AI service is not configured" // 500
}
```

---

### **2. GitHub Activity Endpoint**

**URL**: `https://<project>.supabase.co/functions/v1/github-activity`

**Method**: POST

**Request Body - Profile**:

```json
{
  "username": "srinivasan-web",
  "type": "profile"
}
```

**Response**:

```json
{
  "login": "srinivasan-web",
  "name": "Srinivasan",
  "avatar_url": "https://avatars.githubusercontent.com/u/...",
  "bio": "Full Stack Developer",
  "public_repos": 45,
  "followers": 123,
  "following": 50,
  "html_url": "https://github.com/srinivasan-web"
}
```

**Request Body - Events**:

```json
{
  "username": "srinivasan-web",
  "type": "events"
}
```

**Response**:

```json
[
  {
    "id": "event-123",
    "type": "PushEvent",
    "repo": "srinivasan-web/portfolio",
    "date": "2026-04-14T10:30:00Z",
    "description": "Pushed 3 commits"
  },
  ...
]
```

---

### **3. Contact Email Endpoint**

**URL**: `https://<project>.supabase.co/functions/v1/send-contact-email`

**Method**: POST

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'm interested in working together..."
}
```

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "contactId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Error Response (400)**:

```json
{
  "error": "Invalid email format"
}
```

**Rate Limited Response (429)**:

```json
{
  "error": "Too many requests. Please try again later."
}
```

---

## 🧠 CORE FEATURES & LOGIC

### **1. Authentication Flow**

```
User lands on /auth page
    ↓
Login/Signup form
    ↓
Supabase Auth API processes
    ↓
Session token generated
    ↓
Stored in localStorage
    ↓
useAuth() hook provides user context
    ↓
Protected routes check auth state
    ↓
Redirect if not authenticated
```

**Sign In Process**:

```typescript
const { signIn } = useAuth();
await signIn(email, password);
// Supabase handles password verification
// Returns session if successful
```

### **2. AI Chat Widget Logic**

**Files Involved**:

- `src/components/AIChatWidget.tsx` - UI component
- `src/hooks/useAIAssistant.ts` - Hook with chat logic
- `supabase/functions/ai-assistant/index.ts` - Backend

**User Journey**:

```
1. User clicks chat icon (bottom-right)
2. Chat widget opens with welcome message
3. User types message
4. Frontend validates input (not empty, < 2000 chars)
5. Calls supabase.functions.invoke("ai-assistant", {body: {type: "chat", data: {message}}})
6. Backend validates, rate-limits, sanitizes
7. Sends to Google Gemini API via Lovable gateway
8. Backend returns AI response
9. Frontend displays in chat
10. Auto-scrolls to latest message
```

**Message Storage**:

- In-memory only (not persisted)
- Fresh start each conversation

### **3. GitHub Activity Display**

**Files Involved**:

- `src/components/sections/GitHubActivity.tsx` - UI display
- `src/hooks/useGitHubActivity.ts` - Data fetching
- `supabase/functions/github-activity/index.ts` - Backend

**Data Flow**:

```
1. useGitHubActivity("srinivasan-web") is called
2. Fetches: profile, repos, events, stats
3. GitHub API returns data
4. Processing:
   - Calculate languages distribution
   - Format contribution calendar
   - Extract top repositories
5. Component displays:
   - Profile card (avatar, bio, followers)
   - Repo cards (stars, forks, language)
   - Activity timeline
   - Stats visualization
```

**Rate Limiting**:

- GitHub API: 60 requests/hour (unauthenticated)
- 5000 requests/hour (with token)
- Token stored in server env variable

### **4. Contact Form Logic**

**Validation** (Zod schema):

```typescript
- name: 2-100 characters, string
- email: Valid email format, max 255 chars
- subject: 5-200 characters
- message: 10-5000 characters
```

**Processing**:

```
1. Form submission
2. Zod validation
3. Send to send-contact-email function
4. Backend validates again
5. HTML sanitization
6. Save to database
7. Send 2 emails:
   - Confirmation to user
   - Notification to admin
8. Show success toast
9. Reset form
```

### **5. 3D Floating Shapes** (`src/components/three/FloatingShapes.tsx`)

**Technology**: React Three Fiber + Drei  
**Purpose**: Animated 3D background effect

**Features**:

- Floating geometric shapes
- Responsive to viewport
- Smooth animations
- Optimized rendering

---

## 📊 DATA FLOW

### **Complete Request-Response Cycle**

#### **Example: AI Chat Flow**

```
Frontend Interaction
├─ User types message in chat
├─ onClick: handleSend()
│
├─ Validation (empty check)
│
└─ Call useAIAssistant().chat(message)
    │
    ├─ supabase.functions.invoke("ai-assistant", {body})
    │
    └─ Supabase Edge Function (Deno)
        │
        ├─ Parse request body
        ├─ Validate input (type, message length)
        ├─ Rate limit check (10/min per IP)
        ├─ Set system prompt
        ├─ Call Lovable AI Gateway
        │   └─ POST to https://ai.gateway.lovable.dev/v1/chat/completions
        │       └─ Google Gemini 2.5 Flash generates response
        ├─ Parse AI response
        ├─ Return result {result: ""}
        │
    └─ Frontend receives response
        ├─ Add assistant message to state
        ├─ Display in chat widget
        └─ Auto-scroll to bottom
```

#### **Example: GitHub Activity Flow**

```
Component Mount
├─ useGitHubActivity("srinivasan-web")
│
├─ localStorage check (cached data?)
│
└─ If not cached:
    ├─ supabase.functions.invoke("github-activity")
    │
    └─ Deno Function
        ├─ Fetch https://api.github.com/users/srinivasan-web
        ├─ Fetch https://api.github.com/users/srinivasan-web/repos?sort=updated
        ├─ Fetch https://api.github.com/users/srinivasan-web/events/public
        ├─ Process data (aggregate stats, extract languages)
        ├─ Return {profile, repos, events, stats}
        │
    └─ Frontend
        ├─ Cache in state/React Query
        ├─ Render profile card
        ├─ Render repos grid
        ├─ Render activity timeline
        └─ Show stats
```

---

## 🎓 INTERVIEW Q&A

### **Architecture & System Design**

**Q1: What is the overall architecture of this application?**

- **A**: This is a modern full-stack web application using a decoupled frontend-backend approach:
  - **Frontend**: React + TypeScript + Vite (SPA)
  - **Backend**: Supabase (PostgreSQL + Serverless Functions in Deno)
  - **Integrations**: GitHub API, Lovable AI Gateway
  - The frontend communicates with Supabase functions which act as middleware between the client and external APIs.

**Q2: Why did you choose Supabase over traditional backend?**

- **A**:
  - Zero infrastructure management (serverless)
  - Built-in PostgreSQL database
  - Deno runtime supports TypeScript natively
  - Easy authentication setup
  - Auto-scaling functions
  - Cost-effective for low-medium traffic
  - Real-time capabilities

**Q3: How does rate limiting work in your API?**

- **A**: Implemented client-side (IP-based) rate limiting in Deno functions:
  - In-memory Map to track requests
  - `ai-assistant`: 10 requests/minute per IP
  - `send-contact-email`: 3 submissions/minute per IP
  - Returns 429 status when exceeded
  - Could be enhanced with Redis for distributed systems

---

### **Frontend Development**

**Q4: How do you handle state management in this project?**

- **A**: Three-layered approach:
  1. **Global State**: React Context (`AuthContext` for auth)
  2. **Server State**: React Query (TanStack) for API data caching
  3. **Local State**: useState for form inputs, UI toggles
  - This provides balance between simplicity and scalability

**Q5: Explain the authentication flow.**

- **A**:
  1. User submits credentials on `/auth` page
  2. `signIn()` calls Supabase Auth API
  3. If valid, returns JWT session token
  4. Token stored in localStorage (persistent)
  5. `AuthContext` exposes `useAuth()` hook globally
  6. Protected routes check `user` object
  7. Auto-refresh token on page reload
  8. Sign-out clears session and localStorage

**Q6: How do you handle form validation?**

- **A**:
  - Using Zod library for schema validation (frontend + backend)
  - Schema defines field types, lengths, patterns
  - Frontend shows field-specific error messages
  - Backend validates AGAIN for security
  - React Hook Form integrates with validation
  - Real-time validation on change

**Q7: What's your approach to component architecture?**

- **A**:
  - Atomic design: UI components (button, input) → sections → pages
  - Separation of concerns: presentational vs. container components
  - Custom hooks for business logic (useAIAssistant, useGitHubActivity)
  - Context for global state
  - Props drilling minimized with Context

---

### **Backend & API Development**

**Q8: How do your serverless functions work?**

- **A**: Three Deno functions in Supabase:
  1. **ai-assistant**: Processes chat, recommendations, project summaries
     - Validates input → Calls Lovable AI Gateway → Returns response
  2. **github-activity**: Fetches GitHub data
     - Calls GitHub REST API → Aggregates data → Returns formatted response
  3. **send-contact-email**: Handles contact form
     - Validates input → Saves to DB → Sends 2 emails via Resend

**Q9: How do you ensure API security?**

- **A**: Multiple layers:
  - Input validation (type checking, length limits)
  - HTML sanitization (escape special chars to prevent XSS)
  - Rate limiting per IP
  - CORS headers configured
  - Environment variables for secrets (API keys)
  - Error messages don't leak sensitive info
  - Database queries use parameterized queries

**Q10: How is email sent from the contact form?**

- **A**:
  1. User submits form (name, email, subject, message)
  2. Frontend validates with Zod
  3. Calls Supabase function `send-contact-email`
  4. Backend validates AGAIN + sanitizes
  5. Saves to PostgreSQL `contacts` table
  6. Calls Resend API (third-party email service)
  7. Sends 2 emails:
     - **User**: Confirmation ("We received your message")
     - **Admin**: Notification ("New contact form submission")
  8. Returns success response

---

### **API Integration & External Services**

**Q11: How do you integrate with GitHub API?**

- **A**:
  - GitHub function fetches user profile, repos, events
  - Uses REST API v3 with optional auth token
  - Token in env variable increases rate limits
  - Handles GitHub error responses gracefully
  - Aggregates raw data (calculates stats, extracts languages)
  - Returns formatted JSON to frontend

**Q12: How does the AI assistant integration work?**

- **A**:
  1. Frontend sends chat message to Supabase function
  2. Function validates message (length, content)
  3. Creates system prompt based on request type
  4. Calls Lovable AI Gateway endpoint
  5. Uses Google Gemini 2.5 Flash model
  6. Includes auth token in headers
  7. Returns AI response or error
  8. Frontend displays response in chat widget

**Q13: What's the purpose of the Lovable and Resend integrations?**

- **A**:
  - **Lovable**: AI/LLM gateway abstracting away model complexity, provides simplified API
  - **Resend**: Email service provider (better than SMTP), handles delivery, tracking

---

### **Performance & Optimization**

**Q14: How do you optimize performance?**

- **A**:
  - **Frontend**:
    - Vite for fast builds and dev server (ESM)
    - Code splitting (lazy loading pages)
    - React Query caching API responses
    - Framer Motion for smooth animations
    - Image optimization
  - **Backend**:
    - Serverless functions auto-scale
    - Database indexing on frequently queried fields
    - In-memory caching in functions

**Q15: How do you handle loading and error states?**

- **A**:
  - Loading states: `isLoading` boolean in hooks
  - Error states: returned as `error` or caught with try-catch
  - UI components show spinners during loading
  - Toast notifications for errors
  - Fallback UI for failed requests
  - Error boundaries for React errors

---

### **Database & Data**

**Q16: What data do you persist in the database?**

- **A**:
  - Contact form submissions (name, email, subject, message)
  - Supabase Auth: users, sessions (automatic)
  - Future: Blog posts, admin settings, user preferences
  - Uses PostgreSQL with RLS policies for security

**Q17: How do you handle data validation?**

- **A**:
  - **Frontend**: Zod schema + React Hook Form
  - **Backend**: Zod schema again (never trust client input)
  - Type safety with TypeScript
  - Max length checks to prevent abuse
  - Email regex validation
  - HTML sanitization to prevent XSS

---

### **Deployment & DevOps**

**Q18: How is this project deployed?**

- **A**:
  - Lovable platform handles deployment
  - Connected to GitHub repository
  - Automatic deployments on push to main
  - Frontend served via CDN
  - Backend functions automatically deployed
  - No manual server management

**Q19: How do you handle environment variables?**

- **A**:
  - Frontend: Vite's `import.meta.env.VITE_*` pattern
  - Backend: `Deno.env.get()`
  - Secrets: GitHub Secrets or Lovable settings
  - Different configs for dev/prod environments
  - Never commit `.env` files

---

### **Testing & Quality**

**Q20: How do you ensure code quality?**

- **A**:
  - ESLint for code style
  - TypeScript for type safety
  - Input validation (Zod)
  - Backend validation (server-side security)
  - Error handling with try-catch
  - Rate limiting for API abuse prevention
  - Could add: Unit tests (Jest), E2E tests (Cypress)

---

### **Debugging Common Issues**

**Q21: What if the AI assistant API fails?**

- **A**:
  - Wrapped in try-catch in Supabase function
  - Returns error response to frontend
  - Frontend shows toast: "AI Error: Failed to process request"
  - User can retry or contact support

**Q22: What if GitHub API rate limit is exceeded?**

- **A**:
  - GitHub function checks response status
  - If 403: returns "API rate limit exceeded"
  - Stored auth token increases limits (5000/hr vs 60/hr)
  - Could implement caching to reduce calls

**Q23: What if email sending fails?**

- **A**:
  - Resend API call wrapped in try-catch
  - Still saves contact to database
  - Returns error but contact logged
  - Admin can follow up later
  - Could queue failed emails for retry

---

### **Behavioral & Communication**

**Q24: How would you describe your development approach?**

- **A**: Full-stack mindset with focus on:
  - User experience (smooth animations, clear feedback)
  - Code quality (TypeScript, validation, error handling)
  - Security (input validation, rate limiting, sanitization)
  - Scalability (serverless, caching, modular components)
  - Learning (explored AI, GitHub APIs, Supabase)

**Q25: If you had to add a new feature (e.g., project recommendation), how would you approach it?**

- **A**:
  1. **Design phase**: Understand user needs, plan UX
  2. **Frontend**: Create UI components, add route if needed
  3. **Backend**: Write Supabase function for logic
  4. **API**: Document endpoint and request/response format
  5. **Integration**: Connect frontend to backend
  6. **Validation**: Test inputs, error handling
  7. **Testing**: Manual testing, edge cases
  8. **Deployment**: Push to GitHub, automatic deploy via Lovable

---

### **Technical Depth Questions**

**Q26: Explain your approach to handling async operations in React.**

- **A**:
  - Hooks: `useState` for state, `useEffect` for side effects
  - React Query: `useQuery` for fetching, `useMutation` for mutations
  - Custom hooks abstract async logic (useAIAssistant, useGitHubActivity)
  - Error handling: try-catch, returned error objects
  - Loading states: Show spinner, disable buttons during request
  - Cleanup: AbortController for cancelling in-flight requests

**Q27: How do you structure your codebase for maintainability?**

- **A**:
  ```
  src/
  ├── components/      # Reusable UI components
  ├── pages/          # Page-level components
  ├── hooks/          # Custom hooks (business logic)
  ├── contexts/       # Global state (auth)
  ├── integrations/   # External service clients
  ├── lib/            # Utilities, helpers
  └── App.tsx         # Main routing
  ```

  - Separation of concerns
  - Easy to find related files
  - Scalable as project grows

**Q28: How do you handle TypeScript typing for API responses?**

- **A**:
  - Supabase generates types automatically (`types.ts`)
  - Define interfaces for responses
  - Use discriminated unions for different response types
  - Extract types from responses with `typeof`
  - Provides IDE autocompletion, catches errors at compile time

**Q29: Describe your experience with React hooks.**

- **A**:
  - **Built-in hooks**: useState, useEffect, useContext, useRef, useCallback, useMemo
  - **Custom hooks**: useAIAssistant, useGitHubActivity (encapsulate logic)
  - **External hooks**: React Query (useQuery, useMutation), React Router (useParams, useNavigate)
  - Use for side effects, async operations, derived state

**Q30: How would you optimize a slow API endpoint?**

- **A**:
  1. Add logging/monitoring to identify bottleneck
  2. Optimize database queries (add indexes, pagination)
  3. Implement caching (in-memory, Redis)
  4. Enable compression (gzip)
  5. Consider async processing (queue heavy jobs)
  6. Reduce API response size (pagination, field selection)
  7. Parallelize independent requests

---

## 🚀 KEY TAKEAWAYS FOR INTERVIEW

1. **Full-stack understanding**: Frontend + Backend + APIs + Databases
2. **Security mindset**: Input validation, rate limiting, sanitization, error messages
3. **User experience focus**: Loading states, error handling, animations
4. **Scalability**: Serverless, caching, separation of concerns
5. **Problem-solving**: Can debug, explain trade-offs, suggest improvements
6. **Modern stack**: React, TypeScript, Vite, Supabase, Deno
7. **API integration**: GitHub API, Lovable AI, Resend Email
8. **Code organization**: Clear structure, maintainable, well-documented

---

## 📚 REFERENCES & RESOURCES

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Vite Docs**: https://vitejs.dev
- **React Query Docs**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **GitHub API**: https://docs.github.com/en/rest

---

**Last Updated**: April 2026  
**Project**: Personal Developer Portfolio
