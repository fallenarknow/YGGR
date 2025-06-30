import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@13.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    // Get the Stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Parse the request body
    const { line_items, success_url, cancel_url } = await req.json();

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url,
      cancel_url,
      shipping_address_collection: {
        allowed_countries: ["IN"], // Adjust for your country
      },
      billing_address_collection: "auto",
      metadata: {
        order_id: `order_${Date.now()}`, // Generate a unique order ID
      },
    });

    // Return the session ID
    return new Response(
      JSON.stringify({
        id: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create checkout session",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});