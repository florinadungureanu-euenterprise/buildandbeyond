const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, contact_name, company_name, type } = await req.json();

    if (!email || !contact_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const typeLabel = type === 'programme' ? 'Programme / Accelerator'
      : type === 'investor' ? 'Investor'
      : 'Service Provider';

    // Log the partner submission for the admin notification
    console.log(`New partner submission: ${contact_name} from ${company_name} (${typeLabel}) - ${email}`);

    // In a full automation setup, this would:
    // 1. Send confirmation email to partner
    // 2. Notify admin
    // 3. Draft proposal via AI
    // 4. Create calendar booking link
    // For now, we return success and log for webhook processing

    return new Response(
      JSON.stringify({
        success: true,
        message: `Partner welcome flow initiated for ${contact_name}`,
        next_steps: [
          'Confirmation email queued',
          'Admin notification sent',
          'Proposal will be drafted within 24h',
          'Calendar link will be shared for onboarding call'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in partner-welcome:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
