import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    // Input validation
    if (!type || typeof type !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'type' field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("AI service is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "recommend-projects":
        systemPrompt = `You are an AI assistant for a developer portfolio. Based on the visitor's interests and browsing behavior, recommend relevant projects from the portfolio. Be concise and helpful.`;
        userPrompt = `Based on these interests: ${String(data?.interests || "general tech").slice(0, 500)}, recommend which projects would be most relevant.`;
        break;

      case "skill-match":
        systemPrompt = `You are an AI assistant that matches job requirements to a developer's skills.`;
        userPrompt = `Job requirements: ${String(data?.requirements || "").slice(0, 1000)}. Analyze the match.`;
        break;

      case "summarize-project":
        systemPrompt = `You are an AI that creates concise, engaging summaries of technical projects.`;
        userPrompt = `Summarize this project: Title: ${String(data?.title || "").slice(0, 200)}. Description: ${String(data?.description || "").slice(0, 1000)}.`;
        break;

      case "chat":
        if (!data?.message || typeof data.message !== "string" || data.message.trim().length === 0 || data.message.length > 2000) {
          return new Response(JSON.stringify({ error: "Invalid message" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        systemPrompt = `You are a helpful AI assistant for Srinivasan's developer portfolio. You can answer questions about their skills, projects, and experience. Be friendly, professional, and concise. If asked about contact, direct them to the contact form.`;
        userPrompt = data.message.slice(0, 2000);
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid request type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status);
      throw new Error("AI service error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
