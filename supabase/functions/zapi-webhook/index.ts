
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract the webhook payload
    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload));

    // Create a Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const ADMIN_API_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // For webhook processing, we use the service role key to bypass RLS
    const supabase = createClient(SUPABASE_URL, ADMIN_API_KEY);

    // Determine the webhook type
    const path = new URL(req.url).pathname;
    const pathParts = path.split('/');
    const userId = pathParts[pathParts.length - 1]; // Get userId from path

    if (!userId) {
      console.error('No user ID provided in webhook URL');
      return new Response(
        JSON.stringify({ success: false, error: 'No user ID provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Process based on event type
    if (payload.event === 'messages-received' || payload.event === 'message-received') {
      await handleMessageReceived(supabase, payload, userId);
    } else if (payload.event === 'messages-status' || payload.event === 'message-status') {
      await handleMessageStatus(supabase, payload, userId);
    } else if (payload.event === 'connection-status-change') {
      await handleConnectionStatus(supabase, payload, userId);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

async function handleMessageReceived(supabase, payload, userId) {
  // Extract message data
  const { messageId, phone, body, fromMe, isGroup, type } = payload;
  
  // First, ensure contact exists
  let contactId;
  
  // Check if contact already exists
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('phone', phone)
    .single();
    
  if (existingContact) {
    contactId = existingContact.id;
    
    // Update contact with last message info
    await supabase
      .from('contacts')
      .update({ 
        last_message_at: new Date().toISOString(),
        unread_count: supabase.rpc('increment', { row_id: contactId, increment_amount: 1 })
      })
      .eq('id', contactId);
  } else {
    // Create new contact
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        phone: phone,
        name: phone, // Initially use phone as name
        last_message_at: new Date().toISOString(),
        unread_count: 1
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating contact:', error);
      return;
    }
    
    contactId = newContact.id;
  }
  
  // Save message
  await supabase
    .from('messages')
    .insert({
      user_id: userId,
      contact_id: contactId,
      content: body,
      direction: fromMe ? 'out' : 'in',
      z_api_id: messageId,
      media_type: type !== 'chat' ? type : null,
      media_url: payload.mediaUrl || null
    });
}

async function handleMessageStatus(supabase, payload, userId) {
  // Extract status data
  const { id, status } = payload;
  
  // Map Z-API status to our status
  let mappedStatus = 'sent';
  if (status === 'sent') mappedStatus = 'delivered';
  if (status === 'viewed') mappedStatus = 'read';
  
  // Update message status
  await supabase
    .from('messages')
    .update({ 
      status: mappedStatus,
      delivered_at: mappedStatus === 'delivered' ? new Date().toISOString() : null,
      read_at: mappedStatus === 'read' ? new Date().toISOString() : null
    })
    .eq('z_api_id', id)
    .eq('user_id', userId);
}

async function handleConnectionStatus(supabase, payload, userId) {
  // Extract connection data
  const { connected, smartphoneConnected } = payload;
  
  // Update connection status
  await supabase
    .from('z_api_config')
    .update({ 
      is_connected: connected && smartphoneConnected,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
}
