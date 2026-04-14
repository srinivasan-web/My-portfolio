# TECHNICAL DEEP DIVE - Internal Working

## 📖 INDEX

1. [Frontend Architecture](#frontend-architecture)
2. [Backend Functions](#backend-functions)
3. [API Integration Details](#api-integration-details)
4. [Data Processing Logic](#data-processing-logic)
5. [Error Handling Strategy](#error-handling-strategy)
6. [Performance Considerations](#performance-considerations)

---

## 🎨 FRONTEND ARCHITECTURE

### Application Bootstrap

**File**: `src/main.tsx`

```typescript
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// React 18 createRoot API
createRoot(document.getElementById("root")!).render(<App />);
```

**What happens**:

1. `React.createRoot()` creates a root to render React
2. Finds DOM element with `id="root"` in index.html
3. Renders `<App />` component
4. React takes over the DOM

---

### Root App Component

**File**: `src/App.tsx`

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />        {/* Toast notifications */}
          <Sonner />         {/* Sonner toast library */}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              {/* Other routes... */}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
```

**Provider Stack** (bottom to top):

1. **QueryClientProvider**: React Query caching
2. **ThemeProvider**: Dark/light mode state
3. **AuthProvider**: Authentication context
4. **TooltipProvider**: Radix UI tooltips
5. **Toaster/Sonner**: Toast notification systems
6. **BrowserRouter**: Client-side routing

---

### Authentication Context Deep Dive

**File**: `src/contexts/AuthContext.tsx`

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has admin role via RPC
  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });

      if (error) {
        console.error("Admin role check error:", error);
        return false;
      }
      return data === true;
    } catch (err) {
      console.error("Error in checkAdminRole:", err);
      return false;
    }
  };

  useEffect(() => {
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer admin check to prevent race condition
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id).then(setIsAdmin);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    // Get existing session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkAdminRole(session.user.id).then(setIsAdmin);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{user, session, isAdmin, isLoading, ...}}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Key Points**:

- Listens to Supabase auth state changes
- Checks admin role via RPC (remote procedure call)
- Persists session via Supabase (handles auto-refresh)
- Provides `useAuth()` hook for components

---

### Custom Hook: useAIAssistant

**File**: `src/hooks/useAIAssistant.ts`

```typescript
export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Main chat function
  const chat = useCallback(async (message: string) => {
    setIsLoading(true);
    try {
      // Invoke Supabase function
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "chat",
          data: { message },
        },
      });

      if (error) throw error;
      return data.result; // Return AI response
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "AI Error",
        description: "Failed to get response",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Project recommendation function
  const recommendProjects = useCallback(
    async (
      interests: string,
      viewedProjects: string[],
      projects: Project[],
    ) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "ai-assistant",
          {
            body: {
              type: "recommend-projects",
              data: { interests, viewedProjects, projects },
            },
          },
        );

        if (error) throw error;
        return data.result;
      } catch (error) {
        console.error("Recommendation error:", error);
        toast({
          title: "AI Error",
          description: "Failed to get recommendations",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    chat,
    recommendProjects,
    isLoading,
  };
};
```

**Workflow**:

1. Component calls `const { chat, isLoading } = useAIAssistant()`
2. User sends message → calls `chat(message)`
3. Hook invokes Supabase function with message
4. Function returns AI response
5. Hook returns response to component

---

### Custom Hook: useGitHubActivity

**File**: `src/hooks/useGitHubActivity.ts`

```typescript
export const useGitHubActivity = (username: string | null) => {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      return;
    }

    const fetchGitHubData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch profile
        const { data: profileData, error: profileError } =
          await supabase.functions.invoke("github-activity", {
            body: { username, type: "profile" },
          });

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch repos
        const { data: reposData, error: reposError } =
          await supabase.functions.invoke("github-activity", {
            body: { username, type: "repos" },
          });

        if (reposError) throw reposError;
        setRepos(reposData);

        // Fetch events
        const { data: eventsData, error: eventsError } =
          await supabase.functions.invoke("github-activity", {
            body: { username, type: "events" },
          });

        if (eventsError) throw eventsError;
        setEvents(eventsData);

        // Fetch stats
        const { data: statsData, error: statsError } =
          await supabase.functions.invoke("github-activity", {
            body: { username, type: "stats" },
          });

        if (statsError) throw statsError;
        setStats(statsData);
      } catch (err) {
        console.error("GitHub data fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch GitHub data",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitHubData();
  }, [username]);

  return { profile, repos, events, stats, isLoading, error };
};
```

**Workflow**:

1. Component mounts with username: `useGitHubActivity("srinivasan-web")`
2. useEffect triggers
3. Makes 4 parallel API calls to github-activity function
4. Aggregates all data into state
5. Component re-renders with data

---

## ⚙️ BACKEND FUNCTIONS

### Function 1: AI Assistant (`ai-assistant/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // Create new window
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  // Increment count
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Rate limit check
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    const { type, data } = body;

    // Input validation
    if (!type || typeof type !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'type' field" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get API key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("AI service is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Route based on type
    switch (type) {
      case "recommend-projects":
        systemPrompt = `You are an AI for a dev portfolio. Recommend relevant projects.`;
        userPrompt = `Interests: ${String(data?.interests || "").slice(0, 500)}`;
        break;

      case "skill-match":
        systemPrompt = `Match job requirements to developer skills.`;
        userPrompt = `Requirements: ${String(data?.requirements || "").slice(0, 1000)}`;
        break;

      case "chat":
        // Validate chat message
        if (
          !data?.message ||
          typeof data.message !== "string" ||
          data.message.trim().length === 0 ||
          data.message.length > 2000
        ) {
          return new Response(JSON.stringify({ error: "Invalid message" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        systemPrompt = `You are a helpful AI assistant for Srinivasan's portfolio.`;
        userPrompt = data.message.slice(0, 2000);
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid request type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Call AI service
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const result = await response.json();

    // Extract message from response
    const aiMessage =
      result.choices?.[0]?.message?.content || "I couldn't generate a response";

    return new Response(JSON.stringify({ result: aiMessage }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**Execution Flow**:

```
1. Request arrives (POST)
2. ✓ CORS preflight check
3. ✓ Extract client IP
4. ✓ Rate limit validation
5. ✓ Parse JSON body
6. ✓ Validate request type
7. ✓ Get API key from env
8. ✓ Build prompts based on type
9. ✓ Call Lovable AI Gateway
10. ✓ Parse AI response
11. ✓ Return to client
```

---

### Function 2: GitHub Activity (`github-activity/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: any;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, type } = await req.json();

    if (!username) {
      throw new Error("GitHub username is required");
    }

    // Get GitHub token (optional but increases rate limit)
    const githubToken = Deno.env.get("GITHUB_TOKEN");

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Portfolio-App",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    };

    // Helper to fetch from GitHub
    const fetchGitHubJson = async (url: string) => {
      const res = await fetch(url, { headers });

      const contentType = res.headers.get("content-type") || "";
      const body = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const message =
          typeof body === "object" && body?.message
            ? String(body.message)
            : typeof body === "string"
              ? body
              : "Request failed";

        return {
          ok: false as const,
          status: res.status,
          error: `GitHub API ${res.status}: ${message}`,
          body,
        };
      }

      return { ok: true as const, status: res.status, data: body };
    };

    let result: any = {};

    // Route based on query type
    switch (type) {
      case "profile": {
        // Fetch: login, name, avatar, bio, repos count, followers
        const r = await fetchGitHubJson(
          `https://api.github.com/users/${username}`,
        );
        result = r.ok ? r.data : { error: r.error };
        break;
      }

      case "repos": {
        // Fetch: top 10 repos sorted by update time
        const r = await fetchGitHubJson(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
        );
        result = r.ok ? r.data : { error: r.error };
        break;
      }

      case "events": {
        // Fetch: 30 public events
        const r = await fetchGitHubJson(
          `https://api.github.com/users/${username}/events/public?per_page=30`,
        );

        if (!r.ok) {
          result = { error: r.error };
          break;
        }

        const events: GitHubEvent[] = Array.isArray(r.data) ? r.data : [];

        // Process events into readable format
        result = events.map((event) => ({
          id: event.id,
          type: event.type,
          repo: event.repo?.name || "Unknown",
          date: event.created_at,
          description: getEventDescription(event),
        }));
        break;
      }

      case "stats": {
        // Fetch profile first
        const profileR = await fetchGitHubJson(
          `https://api.github.com/users/${username}`,
        );
        if (!profileR.ok) {
          result = { error: profileR.error };
          break;
        }

        const profile = profileR.data;

        // Fetch repos and calculate stats
        const reposR = await fetchGitHubJson(
          `https://api.github.com/users/${username}/repos?per_page=100`,
        );

        if (!reposR.ok) {
          result = { error: reposR.error };
          break;
        }

        const repos = Array.isArray(reposR.data) ? reposR.data : [];

        // Aggregate stats
        const stats = {
          public_repos: profile.public_repos || 0,
          followers: profile.followers || 0,
          following: profile.following || 0,
          total_stars: repos.reduce(
            (sum: number, repo: any) => sum + (repo.stargazers_count || 0),
            0,
          ),
          total_forks: repos.reduce(
            (sum: number, repo: any) => sum + (repo.forks_count || 0),
            0,
          ),
          top_languages: getTopLanguages(repos),
        };

        result = stats;
        break;
      }

      default:
        throw new Error("Invalid type parameter");
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper functions
function getEventDescription(event: GitHubEvent): string {
  switch (event.type) {
    case "PushEvent":
      return `Pushed ${event.payload?.size || 1} commits`;
    case "PullRequestEvent":
      return `${event.payload?.action || "Action"} pull request`;
    case "IssuesEvent":
      return `${event.payload?.action || "Action"} issue`;
    case "CreateEvent":
      return `Created ${event.payload?.ref_type || "repository"}`;
    default:
      return event.type;
  }
}

function getTopLanguages(repos: any[]): { language: string; count: number }[] {
  const languageCounts: Record<string, number> = {};

  repos.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  return Object.entries(languageCounts)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5
}
```

**Processing Steps**:

```
Request: { username: "srinivasan-web", type: "stats" }
    ↓
1. Fetch user profile from GitHub API
2. Fetch all repos (paginated)
3. Aggregate:
   - Total stars (sum of all stargazers_count)
   - Total forks (sum of all forks_count)
   - Top languages (count repos by language)
4. Return structured response
```

---

### Function 3: Send Contact Email (`send-contact-email/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Send email via Resend API
const sendEmail = async (to: string[], subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests." }), {
      status: 429,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest =
      await req.json();

    // Validation
    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length === 0 ||
      name.length > 200
    ) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0 ||
      message.length > 5000
    ) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // HTML sanitization (prevent XSS)
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeSubject = escapeHtml((subject || "No subject").trim());
    const safeMessage = escapeHtml(message.trim());

    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save to database
    const { data, error: dbError } = await supabase
      .from("contacts")
      .insert({
        name: safeName,
        email: safeEmail,
        subject: safeSubject,
        message: safeMessage,
      })
      .select();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save contact submission");
    }

    // Send user confirmation email
    await sendEmail(
      [safeEmail],
      "We received your message",
      `
        <h2>Hello ${safeName},</h2>
        <p>Thank you for reaching out. I've received your message and will get back to you soon.</p>
        <p><strong>Your message:</strong></p>
        <p>${safeMessage.replace(/\n/g, "<br>")}</p>
      `,
    );

    // Send admin notification email
    await sendEmail(
      ["admin@example.com"], // Change to your email
      `New contact form submission from ${safeName}`,
      `
        <h2>New Contact Submission</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, "<br>")}</p>
      `,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        contactId: data?.[0]?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
```

**Processing Steps**:

```
Request arrives with form data
    ↓
1. Rate limit check
2. Input validation (all fields)
3. Email regex validation
4. HTML escape (prevent XSS)
5. INSERT to PostgreSQL contacts table
6. Send confirmation email (to user)
7. Send notification email (to admin)
8. Return success/error
```

---

## 🔌 API INTEGRATION DETAILS

### Lovable AI Gateway Integration

**URL**: `https://ai.gateway.lovable.dev/v1/chat/completions`

**How it works**:

```typescript
// Backend function creates request
fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,  // Backend secret
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",  // Model selection
    messages: [
      { role: "system", content: "You are..." },
      { role: "user", content: "User message" },
    ],
    temperature: 0.7,      // Creativity (0.7 = balanced)
    max_tokens: 1000,      // Max response length
  }),
})

// Response format
{
  "choices": [
    {
      "message": {
        "content": "AI generated response..."  // Extract this
      }
    }
  ]
}
```

### GitHub REST API Integration

**Base URL**: `https://api.github.com`

**Endpoints Used**:

```
GET  /users/{username}              - User profile
GET  /users/{username}/repos        - User repositories
GET  /users/{username}/events/public - Public events
```

**Rate Limits**:

- Without token: 60 requests/hour
- With token: 5000 requests/hour

**Authentication**:

```
Authorization: Bearer {GITHUB_TOKEN}
```

### Resend Email API Integration

**URL**: `https://api.resend.com/emails`

**How it works**:

```typescript
fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: ["recipient@example.com"],
    subject: "Email Subject",
    html: "<h1>HTML Email Content</h1>",
  }),
})

// Response
{
  "id": "email-id-123",
  "from": "Portfolio Contact <onboarding@resend.dev>",
  "to": ["recipient@example.com"],
  "created_at": "2026-04-14T10:30:00Z"
}
```

## 📊 DATA PROCESSING LOGIC

### GitHub Stats Aggregation

```typescript
// Raw GitHub data
repos = [
  { stargazers_count: 5, forks_count: 2, language: "TypeScript" },
  { stargazers_count: 10, forks_count: 3, language: "Python" },
  { stargazers_count: 3, forks_count: 1, language: "TypeScript" },
]

// Processing
function getTopLanguages(repos) {
  const languageCounts = {};

  // Count repos per language
  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language]++;
    }
  });

  // Convert to array and sort
  return Object.entries(languageCounts)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);  // Top 5 only
}

// Result
[
  { language: "TypeScript", count: 2 },
  { language: "Python", count: 1 },
]

// Stats aggregation
totalStars = 5 + 10 + 3 = 18
totalForks = 2 + 3 + 1 = 6
```

### Contribution Graph Processing

Note: Currently frontend displays GitHub activity timeline. Could enhance with:

```typescript
// Parse GitHub events into contribution calendar
const contributionMap = {};

events.forEach((event) => {
  const date = event.created_at.split("T")[0];
  contributionMap[date] = (contributionMap[date] || 0) + 1;
});

// Result: { "2026-04-14": 5, "2026-04-13": 3, ... }
```

## 🛡️ ERROR HANDLING STRATEGY

### Frontend Error Handling

```typescript
try {
  const { data, error } = await supabase.functions.invoke("api", { body });

  if (error) {
    throw error; // Throw to catch block
  }

  // Process data
  return data;
} catch (error) {
  // Log for debugging
  console.error("API Error:", error);

  // Show user-friendly toast
  toast({
    title: "Error",
    description: error.message || "Something went wrong",
    variant: "destructive",
  });

  // Return null for graceful degradation
  return null;
} finally {
  // Always stop loading state
  setIsLoading(false);
}
```

### Backend Error Handling

```typescript
// Validation error
if (!input) {
  return new Response(JSON.stringify({ error: "Missing field" }), {
    status: 400,
    headers: corsHeaders,
  });
}

// Rate limit error
if (isRateLimited(ip)) {
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: corsHeaders,
  });
}

// API error
try {
  const result = await fetch(externalAPI);
} catch (error) {
  return new Response(JSON.stringify({ error: error.message }), {
    status: 500,
    headers: corsHeaders,
  });
}

// Never expose sensitive info in errors
```

## ⚡ PERFORMANCE CONSIDERATIONS

### Frontend Optimization

1. **Code Splitting**:
   - Vite automatically splits at route level
   - Lazy load components for heavy sections

2. **Caching**:
   - React Query caches API responses
   - localStorage for session tokens
   - Browser cache for static assets

3. **Bundle Size**:
   - Tree shaking removes unused code
   - CSS minification via Tailwind
   - Image optimization

### Backend Optimization

1. **Rate Limiting**:
   - Prevents API abuse
   - Manages resource consumption

2. **Input Validation**:
   - Rejects large payloads early
   - Prevents processing time waste

3. **Database Optimization**:
   - Indexes on frequently queried fields
   - Pagination for large datasets

4. **API Response Optimization**:
   - Return only needed fields
   - Compress with gzip
   - Paginate large responses

---

**This comprehensive guide covers everything needed to ace technical interviews about this system!**
