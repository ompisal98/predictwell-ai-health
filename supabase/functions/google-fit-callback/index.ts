import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // user_id

  if (!code || !state) {
    return new Response("Missing code or state", { status: 400, headers: corsHeaders });
  }

  const CLIENT_ID = Deno.env.get("GOOGLE_FIT_CLIENT_ID");
  const CLIENT_SECRET = Deno.env.get("GOOGLE_FIT_CLIENT_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new Response("Google Fit credentials not configured", { status: 500, headers: corsHeaders });
  }

  const redirectUri = `${SUPABASE_URL}/functions/v1/google-fit-callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Token exchange failed:", tokenData);
      return new Response(`Token exchange failed: ${JSON.stringify(tokenData)}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Store tokens using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase.from("google_fit_tokens").upsert(
      {
        user_id: state,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("DB error:", error);
      return new Response(`Failed to store tokens: ${error.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Redirect back to app with success
    const appUrl = req.headers.get("origin") || "https://predictwell-ai-health.lovable.app";
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${appUrl}/?google_fit=connected`,
      },
    });
  } catch (err) {
    console.error("Callback error:", err);
    return new Response(`Error: ${err.message}`, { status: 500, headers: corsHeaders });
  }
});
