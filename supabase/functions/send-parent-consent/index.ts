import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParentConsentRequest {
  userId: string;
  parentEmail: string;
  minorUsername: string;
  minorAge: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, parentEmail, minorUsername, minorAge }: ParentConsentRequest = await req.json();

    if (!userId || !parentEmail || !minorUsername) {
      throw new Error("Missing required fields: userId, parentEmail, minorUsername");
    }

    // Generate a unique consent token
    const consentToken = crypto.randomUUID();

    // Store the token in the profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        parent_consent_token: consentToken,
        parent_consent_sent_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating profile with consent token:", updateError);
      throw new Error("Failed to generate consent token");
    }

    // Build the consent verification URL
    const baseUrl = Deno.env.get("SITE_URL") || "https://justachat.net";
    const consentUrl = `${baseUrl}/verify-consent?token=${consentToken}&user=${userId}`;

    // Send the email to the parent/guardian
    const emailResponse = await resend.emails.send({
      from: "Justachat <noreply@justachat.net>",
      to: [parentEmail],
      subject: "Parental Consent Required for Minor Account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d1117; color: #e6edf3; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #161b22; border-radius: 12px; padding: 40px; border: 1px solid #30363d;">
            <h1 style="color: #58a6ff; margin-top: 0; font-size: 24px;">Parental Consent Required</h1>
            
            <p style="font-size: 16px; line-height: 1.6;">
              A minor has registered an account on <strong>Justachat™</strong> and listed you as their parent or guardian.
            </p>
            
            <div style="background-color: #21262d; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #58a6ff;">
              <p style="margin: 0 0 8px 0;"><strong>Username:</strong> ${minorUsername}</p>
              <p style="margin: 0;"><strong>Age:</strong> ${minorAge} years old</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">
              In compliance with COPPA regulations, we require parental consent before activating accounts for users under 18 years of age.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              By clicking the button below, you confirm that:
            </p>
            
            <ul style="font-size: 14px; line-height: 1.8; color: #8b949e;">
              <li>You are the parent or legal guardian of this minor</li>
              <li>You consent to them using Justachat™</li>
              <li>You have reviewed and agree to our Terms of Service and Privacy Policy</li>
              <li>You understand that chat logs are retained for 90 days for safety purposes</li>
            </ul>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${consentUrl}" style="display: inline-block; background: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ✓ I Consent to This Account
              </a>
            </div>
            
            <p style="font-size: 14px; color: #8b949e; line-height: 1.6;">
              If you did <strong>not</strong> authorize this registration, please ignore this email. The account will remain inactive.
            </p>
            
            <hr style="border: none; border-top: 1px solid #30363d; margin: 32px 0;">
            
            <p style="font-size: 12px; color: #6e7681; text-align: center; margin: 0;">
              This email was sent by Justachat™. For questions, contact support@justachat.net
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Parent consent email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Consent email sent to parent/guardian" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-parent-consent function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
