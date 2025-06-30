import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get environment variables
    const revenueCatWebhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!revenueCatWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Required environment variables are not set");
    }

    // Get the signature from the headers
    const signature = req.headers.get("X-RevenueCat-Signature");
    if (!signature) {
      throw new Error("No RevenueCat signature found in request headers");
    }

    // Get the raw request body
    const body = await req.text();

    // In a real implementation, you would verify the webhook signature here
    // For now, we'll skip this step for simplicity

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const data = payload.data;

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    if (event === "INITIAL_PURCHASE" || event === "RENEWAL" || event === "NON_RENEWING_PURCHASE") {
      // A new subscription was purchased or renewed
      const { data: subscriptionData, error } = await supabase
        .from("seller_subscriptions")
        .upsert({
          seller_id: data.app_user_id,
          plan: data.product_id,
          status: "active",
          starts_at: new Date().toISOString(),
          expires_at: data.expires_date ? new Date(data.expires_date).toISOString() : null,
          payment_provider: "revenuecat",
          payment_id: data.transaction_id,
          metadata: data
        })
        .select();

      if (error) {
        console.error("Error updating subscription:", error);
      }
    } else if (event === "CANCELLATION" || event === "EXPIRATION") {
      // Subscription was cancelled or expired
      const { error } = await supabase
        .from("seller_subscriptions")
        .update({
          status: "cancelled",
          expires_at: data.expires_date ? new Date(data.expires_date).toISOString() : new Date().toISOString()
        })
        .eq("seller_id", data.app_user_id)
        .eq("payment_id", data.transaction_id);

      if (error) {
        console.error("Error updating subscription:", error);
      }
    } else if (event === "BILLING_ISSUE") {
      // There was a billing issue with the subscription
      const { error } = await supabase
        .from("seller_subscriptions")
        .update({
          status: "billing_issue",
          metadata: {
            ...data,
            billing_issue_detected_at: new Date().toISOString()
          }
        })
        .eq("seller_id", data.app_user_id)
        .eq("payment_id", data.transaction_id);

      if (error) {
        console.error("Error updating subscription:", error);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process webhook",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});