import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { createClient } from "npm:@supabase/supabase-js@2.50.0";

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
    // Get environment variables
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!razorpayKeySecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Required environment variables are not set");
    }

    // Parse the request body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify the payment signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = createHmac("sha256", razorpayKeySecret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details from Razorpay
    const response = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${razorpayKeySecret}`)}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch order details from Razorpay");
    }

    const orderData = await response.json();
    
    // Extract user_id from notes if available
    const userId = orderData.notes?.user_id !== 'guest' ? orderData.notes?.user_id : null;
    
    // Create or update order in Supabase
    const { data, error } = await supabase
      .from("orders")
      .upsert([
        {
          razorpay_order_id,
          razorpay_payment_id,
          buyer_id: userId,
          total_amount: orderData.amount / 100, // Convert from paise to rupees
          status: "confirmed",
          payment_status: "paid",
          order_date: new Date().toISOString(),
        },
      ], { onConflict: 'razorpay_order_id' })
      .select();

    if (error) {
      console.error("Error saving order to database:", error);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
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
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Payment verification failed",
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