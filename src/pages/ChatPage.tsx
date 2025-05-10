
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { Message, Contact } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { sendTextMessage, getConnectionStatus } from '@/services/z-api';
import { supabase } from '@/integrations/supabase/client';

const ChatPage = () => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'chat'>('list');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    refetchInterval: 30000,
  });

  // Fetch contacts
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      if (!session?.user) return [];
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('last_message_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }
      
      return data as Contact[];
    },
    enabled: !!session?.user,
  });

  // Fetch messages for selected contact
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedContactId],
    queryFn: async () => {
      if (!session?.user || !selectedContactId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_id', selectedContactId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      // Mark messages as read
      if (data.length > 0) {
        await supabase
          .from('contacts')
          .update({ unread_count: 0 })
          .eq('id', selectedContactId);
          
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }
      
      return data as Message[];
    },
    enabled: !!session?.user && !!selectedContactId,
  });

  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!session?.user) return;
    
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // If this message belongs to the selected contact, add it to the messages list
          if (selectedContactId && newMessage.contact_id === selectedContactId) {
            queryClient.setQueryData(['messages', selectedContactId], 
              (oldMessages: Message[] = []) => [...oldMessages, newMessage]);
          }
          
          // Update contacts list to show latest message
          queryClient.invalidateQueries({ queryKey: ['contacts'] });
          
          // Show notification for incoming messages not from the current contact
          if (newMessage.direction === 'in' && newMessage.contact_id !== selectedContactId) {
            const contact = contacts.find(c => c.id === newMessage.contact_id);
            if (contact) {
              toast({
                title: `Nova mensagem de ${contact.name}`,
                description: newMessage.content,
              });
            }
          }
        });
      
    // Also subscribe to contact updates
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'contacts' },
      () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      });
      
    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, selectedContactId, contacts, queryClient, toast]);

  useEffect(() => {
    if (selectedContactId) {
      if (isMobile) {
        setViewMode('chat');
      }
    }
  }, [selectedContactId, isMobile]);

  const handleSendMessage = async (content: string) => {
    if (!selectedContactId || !session?.user) return;

    // Find the selected contact
    const selectedContact = contacts.find(c => c.id === selectedContactId);
    if (!selectedContact) return;

    // Check if Z-API is connected
    if (!connectionStatus?.connected) {
      toast({
        variant: "destructive",
        title: "WhatsApp desconectado",
        description: "Conecte seu WhatsApp nas configurações antes de enviar mensagens."
      });
      return;
    }

    try {
      // Create a new message in Supabase
      const { data: newMessage, error } = await supabase.from('messages').insert({
        user_id: session.user.id,
        contact_id: selectedContactId,
        content,
        direction: 'out',
        status: 'sent',
        created_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;

      // Send via Z-API
      const result = await sendTextMessage(selectedContact.phone, content);
      
      if (result.success) {
        // Update message with Z-API ID
        await supabase.from('messages').update({
          z_api_id: result.data?.messageId || result.data?.id
        }).eq('id', newMessage.id);
      } else {
        // Update message status to failed
        await supabase.from('messages').update({
          status: 'failed'
        }).eq('id', newMessage.id);
        
        toast({
          variant: "destructive",
          title: "Erro ao enviar mensagem",
          description: "Não foi possível enviar a mensagem. Tente novamente."
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro ao enviar a mensagem."
      });
    }
  };

  const selectedContact = selectedContactId 
    ? contacts.find(contact => contact.id === selectedContactId) 
    : null;

  // For mobile view
  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {viewMode === 'list' ? (
          <ChatSidebar 
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={(contactId) => setSelectedContactId(contactId)}
          />
        ) : (
          <ChatWindow 
            selectedContact={selectedContact}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBackClick={() => setViewMode('list')}
            isMobile={true}
          />
        )}
      </div>
    );
  }

  // For desktop view
  return (
    <div className="h-full flex">
      <div className="w-96 h-full">
        <ChatSidebar 
          contacts={contacts}
          selectedContactId={selectedContactId}
          onSelectContact={(contactId) => setSelectedContactId(contactId)}
        />
      </div>
      <div className="flex-1 h-full">
        <ChatWindow 
          selectedContact={selectedContact}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatPage;
