
import axios, { AxiosRequestConfig } from 'axios';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';

// We'll get the Z-API credentials from Supabase
let instance_id = '';
let token = '';
let clientToken = '';
let isConfigured = false;

// Helper function to build URLs
const buildUrl = (endpoint: string) => {
  return `https://api.z-api.io/instances/${instance_id}${endpoint}`;
};

// Helper function to build request config
const buildConfig = (extraConfig: AxiosRequestConfig = {}): AxiosRequestConfig => {
  return {
    headers: {
      'Client-Token': clientToken,
      'Content-Type': 'application/json',
      ...extraConfig.headers,
    },
    ...extraConfig,
  };
};

// Initialize Z-API with credentials
export const initZApi = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('z_api_config')
      .select('instance_id, token, client_token')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error loading Z-API configuration:', error);
      return false;
    }

    instance_id = data.instance_id;
    token = data.token;
    clientToken = data.client_token;
    isConfigured = true;
    
    console.log('Z-API initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Z-API:', error);
    return false;
  }
};

// Save Z-API configuration
export const saveZApiConfig = async (
  userId: string,
  instanceId: string,
  apiToken: string,
  clientApiToken: string
) => {
  try {
    const { data, error } = await supabase.from('z_api_config').upsert(
      {
        user_id: userId,
        instance_id: instanceId,
        token: apiToken,
        client_token: clientApiToken,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) throw error;

    // Update local variables
    instance_id = instanceId;
    token = apiToken;
    clientToken = clientApiToken;
    isConfigured = true;

    return { success: true };
  } catch (error) {
    console.error('Error saving Z-API config:', error);
    return { success: false, error };
  }
};

// Get QR code for connection
export const getQrCode = async () => {
  if (!isConfigured) {
    return { success: false, error: 'Z-API not configured' };
  }

  try {
    const url = buildUrl(`/token/${token}/qr-code/image`);
    const response = await axios.get(url, buildConfig());
    
    // Update QR code in Supabase
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId) {
      await supabase.from('z_api_config').update({
        qr_code: response.data,
        qr_code_updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error getting QR code:', error);
    return { success: false, error };
  }
};

// Get connection status
export const getConnectionStatus = async () => {
  if (!isConfigured) {
    return { connected: false, error: 'Z-API not configured' };
  }

  try {
    const url = buildUrl(`/token/${token}/status`);
    const response = await axios.get(url, buildConfig());
    
    // Update connection status in Supabase
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId) {
      await supabase.from('z_api_config').update({
        is_connected: response.data.connected,
        phone_number: response.data.phone?.connected ? response.data.phone.phone : null,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error checking Z-API connection status:', error);
    return { connected: false, error: 'Failed to check connection' };
  }
};

// Send text message
export const sendTextMessage = async (phone: string, message: string) => {
  if (!isConfigured) {
    return { success: false, error: 'Z-API not configured' };
  }

  try {
    const url = buildUrl(`/token/${token}/send-text`);
    const response = await axios.post(url, { phone, message }, buildConfig());
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending text message:', error);
    return { success: false, error: 'Failed to send message' };
  }
};

// Send media message (image, video, document)
export const sendMediaMessage = async (
  phone: string,
  mediaUrl: string,
  caption: string = '',
  mediaType: 'image' | 'video' | 'document' = 'image',
  filename?: string
) => {
  if (!isConfigured) {
    return { success: false, error: 'Z-API not configured' };
  }

  try {
    let url: string;
    let payload: any = { phone };

    switch (mediaType) {
      case 'image':
        url = buildUrl(`/token/${token}/send-image`);
        payload = { ...payload, image: mediaUrl, caption };
        break;
      case 'video':
        url = buildUrl(`/token/${token}/send-video`);
        payload = { ...payload, video: mediaUrl, caption };
        break;
      case 'document':
        const fileExt = filename?.split('.').pop() || 'pdf';
        url = buildUrl(`/token/${token}/send-document/${fileExt}`);
        payload = { ...payload, document: mediaUrl, fileName: filename || 'document', caption };
        break;
      default:
        return { success: false, error: 'Invalid media type' };
    }

    const response = await axios.post(url, payload, buildConfig());
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error sending ${mediaType} message:`, error);
    return { success: false, error: `Failed to send ${mediaType}` };
  }
};

// Get message history from a specific contact
export const getMessageHistory = async (phone: string) => {
  if (!isConfigured) {
    return { success: false, error: 'Z-API not configured' };
  }

  try {
    const url = buildUrl(`/token/${token}/messages/${phone}`);
    const response = await axios.get(url, buildConfig());
    
    return { success: true, messages: response.data };
  } catch (error) {
    console.error('Error fetching message history:', error);
    return { success: false, error: 'Failed to fetch message history' };
  }
};

// Send a bulk message to multiple contacts
export const sendBulkMessage = async (
  phones: string[],
  message: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video' | 'document',
  delaySeconds: number = 3
) => {
  if (!isConfigured) {
    return { success: false, error: 'Z-API not configured' };
  }

  try {
    const results = [];
    
    for (const phone of phones) {
      let result;
      
      if (mediaUrl && mediaType) {
        result = await sendMediaMessage(phone, mediaUrl, message, mediaType);
      } else {
        result = await sendTextMessage(phone, message);
      }
      
      results.push({ phone, status: result.success ? 'queued' : 'failed', ...result });
      
      // Add delay between messages to avoid blocking
      if (delaySeconds > 0 && phone !== phones[phones.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      }
    }
    
    return {
      status: 'success',
      total: phones.length,
      results
    };
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    return { success: false, error: 'Failed to send bulk messages' };
  }
};

// Update webhooks configuration
export const updateWebhooks = async (webhookUrl: string) => {
  if (!isConfigured) {
    return { success: false, error: 'Z-API not configured' };
  }

  try {
    const url = buildUrl(`/token/${token}/webhooks`);
    const payload = {
      messageIn: webhookUrl, 
      messageOut: webhookUrl,
      messageStatus: webhookUrl,
      qrCode: webhookUrl,
      disconnected: webhookUrl,
      connected: webhookUrl
    };
    
    const response = await axios.post(url, payload, buildConfig());
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating webhooks:', error);
    return { success: false, error: 'Failed to update webhooks' };
  }
};

// Check if phone number exists on WhatsApp
export const checkPhoneExists = async (phone: string) => {
  if (!isConfigured) {
    return { success: false, error: 'Z-API not configured' };
  }

  try {
    const url = buildUrl(`/token/${token}/phone-exists/${phone}`);
    const response = await axios.get(url, buildConfig());
    
    return { success: true, exists: response.data.exists };
  } catch (error) {
    console.error('Error checking if phone exists:', error);
    return { success: false, error: 'Failed to check if phone exists' };
  }
};

// Add initZApi to App component so it's available throughout the app
export const setupZApi = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return await initZApi(user.id);
    }
    return false;
  } catch (error) {
    console.error('Error setting up Z-API:', error);
    return false;
  }
};
