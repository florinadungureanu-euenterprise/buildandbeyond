import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all users with profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, company_name");

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users to send digest to" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get recent scraped tools (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: newTools } = await supabase
      .from("scraped_tools")
      .select("name, category, description")
      .gte("created_at", weekAgo)
      .limit(5);

    // Get recent events
    const { data: upcomingEvents } = await supabase
      .from("event_submissions")
      .select("title, event_date, location, type")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3);

    // Get recent forum activity
    const { data: recentPosts } = await supabase
      .from("forum_posts")
      .select("title, category")
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(5);

    const digestSummary = {
      new_tools_count: newTools?.length || 0,
      new_tools: newTools || [],
      upcoming_events: upcomingEvents || [],
      community_posts: recentPosts || [],
      total_users_notified: profiles.length,
    };

    console.log("Weekly digest generated:", JSON.stringify(digestSummary));

    return new Response(JSON.stringify({
      success: true,
      summary: digestSummary,
      message: `Digest prepared for ${profiles.length} users`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Digest error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
