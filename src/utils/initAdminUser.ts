
import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async () => {
  try {
    const response = await fetch(`https://tqfwxunwkdjxuwgtohml.functions.supabase.co/create-admin-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
    return { error };
  }
};

export const loginAsAdmin = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@mayachat.com',
      password: 'mayachat123'
    });
    
    if (error) throw error;
    
    return { data };
  } catch (error) {
    console.error("Erro ao fazer login como admin:", error);
    return { error };
  }
};
