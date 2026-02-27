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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const CLIENT_ID = Deno.env.get("GOOGLE_FIT_CLIENT_ID");
  const CLIENT_SECRET = Deno.env.get("GOOGLE_FIT_CLIENT_SECRET");

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub;

  // Get stored tokens
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: tokenRow, error: tokenError } = await supabaseAdmin
    .from("google_fit_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (tokenError || !tokenRow) {
    return new Response(JSON.stringify({ error: "Google Fit not connected", connected: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let accessToken = tokenRow.access_token;

  // Refresh if expired
  if (new Date(tokenRow.expires_at) <= new Date()) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: "Google credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokenRow.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const refreshData = await refreshRes.json();
    if (!refreshRes.ok) {
      console.error("Refresh failed:", refreshData);
      return new Response(JSON.stringify({ error: "Token refresh failed", connected: false }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    accessToken = refreshData.access_token;
    const expiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

    await supabaseAdmin.from("google_fit_tokens").update({
      access_token: accessToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
  }

  // Fetch today's steps from Google Fit
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() * 1e6; // nanoseconds
  const endOfDay = Date.now() * 1e6;

  try {
    const fitRes = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: Math.floor(startOfDay / 1e6),
          endTimeMillis: Math.floor(endOfDay / 1e6),
        }),
      }
    );

    const fitData = await fitRes.json();

    if (!fitRes.ok) {
      console.error("Fit API error:", fitData);
      return new Response(JSON.stringify({ error: `Google Fit API error [${fitRes.status}]: ${JSON.stringify(fitData)}` }), {
        status: fitRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let steps = 0;
    if (fitData.bucket) {
      for (const bucket of fitData.bucket) {
        for (const dataset of bucket.dataset) {
          for (const point of dataset.point) {
            for (const val of point.value) {
              steps += val.intVal || 0;
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ steps, connected: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Fit fetch error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
