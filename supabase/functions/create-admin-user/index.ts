
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user exists
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    if (searchError) {
      throw new Error(`Erro ao verificar usuários: ${searchError.message}`);
    }
    
    const adminExists = existingUsers.users.some(u => u.email === "admin@mayachat.com");
    
    if (adminExists) {
      return new Response(
        JSON.stringify({ message: "Usuário admin já existe" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create admin user
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@mayachat.com",
      password: "mayachat123",
      email_confirm: true,
      user_metadata: { full_name: "Administrador" }
    });

    if (error) {
      throw error;
    }
    
    // Create profile
    if (user) {
      await supabaseAdmin
        .from("profiles")
        .insert({ id: user.user.id, full_name: "Administrador" });
    }

    return new Response(
      JSON.stringify({ message: "Usuário admin criado com sucesso", user }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
