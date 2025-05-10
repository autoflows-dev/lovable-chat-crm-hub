
import { useState } from 'react';
import { mockContacts } from '@/config/mock-data';
import BulkMessageForm from '@/components/bulk-messages/BulkMessageForm';
import { sendBulkMessage } from '@/services/z-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const BulkMessagesPage = () => {
  const { toast } = useToast();

  const handleSendBulkMessage = (contactIds: string[], message: string, mediaUrl?: string) => {
    // Get phone numbers from selected contact IDs
    const selectedContacts = mockContacts.filter(contact => contactIds.includes(contact.id));
    const phoneNumbers = selectedContacts.map(contact => contact.phone);
    
    // Call the Z-API service to send bulk messages
    sendBulkMessage(phoneNumbers, message, mediaUrl)
      .then(response => {
        toast({
          title: "Mensagem em massa enviada",
          description: `${contactIds.length} mensagens foram enfileiradas para envio.`
        });
      })
      .catch(error => {
        toast({
          variant: "destructive",
          title: "Erro ao enviar mensagens",
          description: "Não foi possível enviar as mensagens em massa. Tente novamente."
        });
        console.error('Error sending bulk messages:', error);
      });
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
        contacts={mockContacts}
        onSendBulkMessage={handleSendBulkMessage}
      />
    </div>
  );
};

export default BulkMessagesPage;
