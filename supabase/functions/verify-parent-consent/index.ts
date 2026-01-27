import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyConsentRequest {
  token: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token, userId }: VerifyConsentRequest = await req.json();

    if (!token || !userId) {
      throw new Error("Missing required fields: token, userId");
    }

    // Verify the token matches the stored token for this user
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("parent_consent_token, parent_consent_sent_at, username")
      .eq("user_id", userId)
      .single();

    if (fetchError || !profile) {
      console.error("Error fetching profile:", fetchError);
      throw new Error("User not found");
    }

    if (profile.parent_consent_token !== token) {
      throw new Error("Invalid consent token");
    }

    // Check if token is expired (7 days)
    const sentAt = new Date(profile.parent_consent_sent_at);
    const now = new Date();
    const daysDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      throw new Error("Consent token has expired. Please request a new verification email.");
    }

    // Update the profile to mark consent as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        parent_consent_verified: true,
        parent_consent_token: null, // Clear the token after use
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating consent status:", updateError);
      throw new Error("Failed to verify consent");
    }

    console.log(`Parental consent verified for user: ${profile.username}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Parental consent verified successfully",
        username: profile.username 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-parent-consent function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
