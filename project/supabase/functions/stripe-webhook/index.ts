import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@13.2.0";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Required environment variables are not set");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found in request headers");
    }

    // Get the raw request body
    const body = await req.text();

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    );

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Extract customer information
      const customer = {
        email: session.customer_details?.email,
        name: session.customer_details?.name,
        phone: session.customer_details?.phone,
      };
      
      // Get shipping address if available
      const shippingAddress = session.shipping_details?.address ? {
        line1: session.shipping_details.address.line1,
        line2: session.shipping_details.address.line2,
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        postal_code: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country,
      } : null;
      
      // Get order ID from metadata
      const orderId = session.metadata?.order_id;
      
      // Create order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            id: orderId,
            buyer_id: null, // Will be updated if user is authenticated
            total_amount: session.amount_total / 100, // Convert from cents/paise
            status: "confirmed",
            payment_status: "paid",
            shipping_address: shippingAddress,
            stripe_session_id: session.id,
            customer_email: customer.email,
            customer_name: customer.name,
            customer_phone: customer.phone,
          },
        ])
        .select();

      if (orderError) {
        throw new Error(`Error creating order: ${orderError.message}`);
      }

      // TODO: Create order items in Supabase
      // This would require passing line item details in the session metadata
      // or retrieving the cart from a database using the customer's session
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