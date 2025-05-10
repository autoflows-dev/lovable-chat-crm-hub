
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import BulkMessageForm from '@/components/bulk-messages/BulkMessageForm';
import { sendBulkMessage, getConnectionStatus } from '@/services/z-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types';

const BulkMessagesPage = () => {
  const { toast } = useToast();
  
  // Get user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Check if Z-API is connected
  const { data: connectionStatus } = useQuery({
    queryKey: ['zapi-status'],
    queryFn: async () => {
      return await getConnectionStatus();
    },
    enabled: !!session?.user,
  });
  
  // Fetch contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['bulk-contacts'],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
        
      if (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }
      
      return data as Contact[];
    },
    enabled: !!session?.user,
  });
  
  // Mutation for sending bulk messages
  const sendBulkMessageMutation = useMutation({
    mutationFn: async ({ contactIds, message, mediaUrl }: { 
      contactIds: string[], 
      message: string, 
      mediaUrl?: string 
    }) => {
      // Check if Z-API is connected
      if (!connectionStatus?.connected) {
        throw new Error('WhatsApp não está conectado');
      }
      
      // Get phone numbers from selected contacts
      const selectedContacts = contacts.filter(contact => contactIds.includes(contact.id));
      const phoneNumbers = selectedContacts.map(contact => contact.phone);
      
      // Save campaign to database
      const { data: campaign, error } = await supabase
        .from('bulk_campaigns')
        .insert({
          user_id: session?.user?.id,
          name: `Campanha ${new Date().toLocaleDateString()}`,
          message,
          media_url: mediaUrl,
          status: 'sending',
          contacts: contactIds,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Call the Z-API service to send bulk messages
      const result = await sendBulkMessage(phoneNumbers, message, mediaUrl);
      
      // Update campaign status
      await supabase
        .from('bulk_campaigns')
        .update({
          status: result.status === 'success' ? 'completed' : 'failed',
          results: result,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id);
      
      return result;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Mensagem em massa enviada",
        description: `${variables.contactIds.length} mensagens foram enfileiradas para envio.`
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagens",
        description: error instanceof Error ? error.message : "Não foi possível enviar as mensagens em massa."
      });
    }
  });

  const handleSendBulkMessage = (contactIds: string[], message: string, mediaUrl?: string) => {
    // Check if WhatsApp is connected
    if (!connectionStatus?.connected) {
      toast({
        variant: "destructive",
        title: "WhatsApp desconectado",
        description: "Conecte seu WhatsApp nas configurações antes de enviar mensagens."
      });
      return;
    }
    
    sendBulkMessageMutation.mutate({ contactIds, message, mediaUrl });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Disparos em Massa</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Envie mensagens para múltiplos contatos de uma vez
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
          <CardDescription>
            Como usar o sistema de disparos em massa
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mx-auto">
                1
              </div>
              <h3 className="font-medium text-center">Selecionar Contatos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Escolha quais contatos receberão sua mensagem
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mx-auto">
                2
              </div>
              <h3 className="font-medium text-center">Compor Mensagem</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Crie sua mensagem e adicione mídia opcional
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mx-auto">
                3
              </div>
              <h3 className="font-medium text-center">Enviar ou Agendar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Dispare imediatamente ou agende para envio posterior
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <BulkMessageForm 
        contacts={contacts}
        onSendBulkMessage={handleSendBulkMessage}
        isLoading={sendBulkMessageMutation.isPending}
      />
    </div>
  );
};

export default BulkMessagesPage;
