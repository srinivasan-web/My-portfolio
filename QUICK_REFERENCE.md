# Quick Reference Guide - API & System Flow

## 🎯 QUICK FACTS

| Aspect            | Details                                                             |
| ----------------- | ------------------------------------------------------------------- |
| **Project Type**  | Personal Developer Portfolio (React SPA)                            |
| **Frontend**      | React 18 + TypeScript + Vite + Tailwind + shadcn/ui                 |
| **Backend**       | Supabase (PostgreSQL + Deno functions)                              |
| **APIs**          | GitHub REST API, Lovable AI Gateway, Resend Email                   |
| **Deployment**    | Lovable platform (auto-deploy from GitHub)                          |
| **Main Features** | Portfolio showcase, AI chat, GitHub integration, Contact form, Blog |

---

## 🔌 API ENDPOINTS AT A GLANCE

### 1. **AI Assistant** - Smart Chat & Recommendations

```
POST /functions/v1/ai-assistant

Request:  { type: "chat", data: { message: "your question" } }
Response: { result: "AI response..." }
Rate:     10 requests/minute per IP
Uses:     Google Gemini 2.5 Flash (via Lovable gateway)
```

### 2. **GitHub Activity** - Real-time GitHub Data

```
POST /functions/v1/github-activity

Request:  { username: "user", type: "profile|repos|events|stats" }
Response: { profile: {...}, repos: [...], events: [...] }
Rate:     60 req/hr (unauthenticated), 5000 req/hr (with token)
Uses:     GitHub REST API v3
```

### 3. **Send Contact Email** - Contact Form Processor

```
POST /functions/v1/send-contact-email

Request:  { name, email, subject, message }
Response: { success: true, contactId: "..." }
Rate:     3 submissions/minute per IP
Uses:     Resend API for email + PostgreSQL for storage
```

---

## 📊 DATA FLOW DIAGRAMS

### Flow 1: User Sends Chat Message

```
User types in chat widget
        ↓
Frontend validation (not empty)
        ↓
Calls useAIAssistant().chat(message)
        ↓
supabase.functions.invoke("ai-assistant", {body: {type: "chat", data: {message}}})
        ↓
Supabase Function validates + rate-limits + sanitizes
        ↓
Calls Lovable AI Gateway
        ↓
Google Gemini processes request
        ↓
Returns response to function
        ↓
Function returns to frontend
        ↓
Message added to state
        ↓
Displayed in chat widget
```

### Flow 2: GitHub Activity Loads

```
Component mounts: <GitHubActivity username="srinivasan-web" />
        ↓
useGitHubActivity("srinivasan-web") called
        ↓
Check React Query cache
        ↓
If not cached, invoke github-activity function
        ↓
Deno function: Fetch profile, repos, events from GitHub API
        ↓
Aggregate: Calculate stats, extract languages
        ↓
Return formatted data
        ↓
React Query caches result
        ↓
Component renders profile card + repos + activity
```

### Flow 3: Contact Form Submission

```
User fills form: name, email, subject, message
        ↓
Click submit
        ↓
Frontend validates with Zod schema
        ↓
Show errors if invalid
        ↓
If valid, call send-contact-email function
        ↓
Backend validates again + rate-limits
        ↓
HTML sanitize inputs (prevent XSS)
        ↓
Save to PostgreSQL contacts table
        ↓
Send 2 emails via Resend API:
   - User confirmation email
   - Admin notification email
        ↓
Return success response
        ↓
Show success toast
        ↓
Reset form
```

---

## 🔐 SECURITY FEATURES

| Layer                | Implementation                             |
| -------------------- | ------------------------------------------ |
| **Input Validation** | Zod schemas (frontend + backend)           |
| **Rate Limiting**    | IP-based (memory map) in Deno functions    |
| **Sanitization**     | HTML escape to prevent XSS                 |
| **Authentication**   | Supabase Auth + JWT tokens in localStorage |
| **CORS**             | Configured headers in Deno functions       |
| **Env Secrets**      | GitHub Secrets for API keys                |
| **Error Handling**   | Generic error messages (no sensitive info) |

---

## 📱 COMPONENT STRUCTURE

```
App (Root)
├── Navbar (Navigation)
├── Index Page (Homepage)
│   ├── Hero (Welcome section)
│   ├── About (Bio)
│   ├── Skills (Tech stack)
│   ├── Projects (Portfolio)
│   ├── Timeline (Career)
│   ├── GitHubActivity (GitHub integration)
│   ├── Testimonials (Social proof)
│   ├── Contact (Form + info)
│   └── Newsletter (Signup)
├── Footer
├── AIChatWidget (Floating chat)
└── Auth, Admin, Blog pages (Other routes)
```

---

## 🎭 STATE MANAGEMENT LAYERS

### Layer 1: Global State (Context)

```typescript
AuthContext
├── user: User object or null
├── session: JWT session or null
├── isAdmin: boolean
├── signIn(email, password)
├── signUp(email, password)
└── signOut()
```

### Layer 2: Server State (React Query)

```typescript
useQuery({
  queryKey: ["github-activity", username],
  queryFn: () => fetchGitHubData(username),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Layer 3: Local State (useState)

```typescript
const [formData, setFormData] = useState({...})
const [isOpen, setIsOpen] = useState(false)
const [messages, setMessages] = useState([...])
```

---

## 🚀 KEY HOOKS

| Hook                  | Location             | Purpose                         |
| --------------------- | -------------------- | ------------------------------- |
| `useAuth()`           | AuthContext          | Get user, session, auth methods |
| `useAIAssistant()`    | useAIAssistant.ts    | Chat, AI functions              |
| `useGitHubActivity()` | useGitHubActivity.ts | Fetch GitHub data               |
| `useQuery()`          | React Query          | Fetch + cache data              |
| `useMutation()`       | React Query          | Mutations (create, update)      |
| `useRouter()`         | React Router         | Navigation                      |

---

## 💾 DATABASE SCHEMA (PostgreSQL)

### contacts table

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### Automatic Supabase Tables

```
auth.users          -- Managed by Supabase Auth
auth.sessions       -- JWT sessions
auth.refresh_tokens -- Token refresh
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

| Area          | Strategy                                 |
| ------------- | ---------------------------------------- |
| **Build**     | Vite (ESM), code splitting, minification |
| **Caching**   | React Query, localStorage                |
| **Images**    | Optimized assets, lazy loading           |
| **Bundle**    | Tree shaking, dead code elimination      |
| **API**       | Pagination, field selection, compression |
| **Functions** | Auto-scaling, in-memory caching          |

---

## 🛡️ ERROR HANDLING PATTERNS

### Frontend

```typescript
try {
  const response = await supabase.functions.invoke("api-name", { body });
  if (error) throw error;
  // Process response
} catch (error) {
  console.error(error);
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
  return null;
}
```

### Backend

```typescript
if (!input || typeof input !== "string") {
  return new Response(JSON.stringify({ error: "Invalid input" }), {
    status: 400,
    headers: corsHeaders,
  });
}

try {
  // Process request
} catch (error) {
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500,
    headers: corsHeaders,
  });
}
```

---

## 📈 RATE LIMITING IMPLEMENTATION

```typescript
// In-memory rate limiter
const rateLimitMap = new Map<string, {count: number, resetAt: number}>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, {count: 1, resetAt: now + WINDOW_MS})
    return false
  }

  entry.count++
  return entry.count > MAX_REQUESTS
}

// Usage
if (isRateLimited(clientIp)) {
  return 429 response
}
```

---

## 🔐 INPUT VALIDATION EXAMPLE

```typescript
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(10).max(5000),
});

const result = contactSchema.safeParse(data);
if (!result.success) {
  // Handle errors
}
```

---

## 🌐 ENVIRONMENT VARIABLES

```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=xxx

# Backend (Supabase secrets)
LOVABLE_API_KEY=xxx
GITHUB_TOKEN=xxx
RESEND_API_KEY=xxx
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## 📋 COMMON INTERVIEW QUESTIONS & QUICK ANSWERS

| Q                   | Quick Answer                                                  |
| ------------------- | ------------------------------------------------------------- |
| Architecture?       | React SPA + Supabase backend + Deno functions                 |
| Why Supabase?       | Serverless, built-in auth, PostgreSQL, TypeScript support     |
| State management?   | Context (auth) + React Query (server) + useState (local)      |
| Security?           | Input validation, rate limiting, sanitization, env secrets    |
| How chat works?     | Frontend → Supabase function → Lovable AI → Gemini → Response |
| GitHub integration? | Function fetches from GitHub API → Processes → Returns        |
| Contact form?       | Validate → Save to DB → Send 2 emails via Resend              |
| Rate limiting?      | In-memory Map tracking IP + timestamp                         |
| Error handling?     | Try-catch + toast notifications + generic error messages      |
| Deployment?         | Lovable platform, auto-deploys on GitHub push                 |

---

## 🎓 TECHNICAL TERMS EXPLAINED

| Term              | Meaning                                                     |
| ----------------- | ----------------------------------------------------------- |
| **SPA**           | Single Page Application (client-side routing)               |
| **Serverless**    | No server to manage, pay per execution                      |
| **Deno**          | Runtime like Node.js, but with TypeScript support           |
| **JWT**           | JSON Web Token (stateless authentication)                   |
| **CORS**          | Cross-Origin Resource Sharing (allow cross-domain requests) |
| **Rate Limiting** | Restrict number of requests from IP/user                    |
| **Sanitization**  | Remove/encode harmful characters                            |
| **React Query**   | Data fetching + caching library                             |
| **Zod**           | Schema validation library                                   |
| **ESM**           | ES Modules (modern import/export)                           |

---

## 🔍 DEBUGGING CHECKLIST

- [ ] Check browser console for errors
- [ ] Check Supabase function logs
- [ ] Verify API rate limits
- [ ] Validate input format
- [ ] Check environment variables set
- [ ] Verify CORS headers
- [ ] Test with valid data
- [ ] Check network tab for response
- [ ] Review error message details
- [ ] Check server-side validation

---

**Print this for quick reference during interviews!**
