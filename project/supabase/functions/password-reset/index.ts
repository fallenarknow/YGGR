import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Handle request to initiate password reset
    if (path === "request") {
      const { email } = await req.json();
      
      if (!email) {
        throw new Error("Email is required");
      }

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError) {
        // Don't reveal if user exists or not for security
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "If your email is registered, you will receive a password reset link" 
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Generate reset token and URL
      const resetUrl = `${url.origin}/reset-password`;
      
      const { data, error } = await supabase.rpc(
        "request_password_reset",
        { 
          user_email: email, 
          reset_url_base: resetUrl 
        }
      );

      if (error) {
        throw error;
      }

      // In a real implementation, you would send an email here
      // For now, we just return success
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If your email is registered, you will receive a password reset link",
          // Only include the reset URL in development
          ...(Deno.env.get("ENVIRONMENT") === "development" ? { resetUrl: data } : {})
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Handle password reset completion
    if (path === "reset") {
      const { token, password } = await req.json();
      
      if (!token || !password) {
        throw new Error("Token and password are required");
      }
      
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      const { data, error } = await supabase.rpc(
        "handle_password_reset",
        { 
          reset_token: token, 
          new_password: password 
        }
      );

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to reset password");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Password has been reset successfully" 
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // If no valid path is provided
    throw new Error("Invalid endpoint");
    
  } catch (error) {
    console.error("Password reset error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred during the password reset process",
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