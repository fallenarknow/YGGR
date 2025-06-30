import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Razorpay-Signature",
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
    const razorpayWebhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!razorpayWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Required environment variables are not set");
    }

    // Get the signature from the headers
    const signature = req.headers.get("X-Razorpay-Signature");
    if (!signature) {
      throw new Error("No Razorpay signature found in request headers");
    }

    // Get the raw request body
    const body = await req.text();

    // Verify the webhook signature
    const expectedSignature = createHmac("sha256", razorpayWebhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid webhook signature");
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentData = payload.payload.payment.entity;

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    if (event === "payment.authorized") {
      // Payment was authorized
      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          razorpay_payment_id: paymentData.id,
        })
        .eq("razorpay_order_id", paymentData.order_id)
        .select();

      if (error) {
        console.error("Error updating order:", error);
      }
    } else if (event === "payment.failed") {
      // Payment failed
      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
          razorpay_payment_id: paymentData.id,
        })
        .eq("razorpay_order_id", paymentData.order_id)
        .select();

      if (error) {
        console.error("Error updating order:", error);
      }
    } else if (event === "refund.processed") {
      // Refund was processed
      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: "refunded",
          status: "refunded",
        })
        .eq("razorpay_payment_id", paymentData.id)
        .select();

      if (error) {
        console.error("Error updating order:", error);
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